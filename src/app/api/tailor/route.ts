import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildTailoringPrompt } from '@/lib/gemini/prompts/tailor';
import { detectAtsFamily } from '@/lib/ats-detection';
import { scanResumeRedFlags } from '@/lib/resume-red-flags';
import { getPlanLimits, getEffectivePlan, type Plan } from '@/lib/plans';
import { analysisActionSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';
import { CURRENT_MONTH, releaseMonthlyUsage, reserveMonthlyUsage } from '@/lib/usage-tracking';
import { createTailoredResumeVersionRecord } from '@/lib/versioned-workspace-records';
import { checkRateLimit } from '@/lib/ratelimit';
import { logAiError } from '@/lib/admin/log-ai-error';
import { z } from 'zod';

const tailoredResumeSaveSchema = z.object({
  application_id: z.string().uuid({ message: 'Invalid application ID' }),
  analysis_id: z.string().uuid({ message: 'Invalid analysis ID' }),
  content: z.object({
    tailored_summary: z.string().optional(),
    tailored_bullets: z.array(z.object({
      original: z.string(),
      tailored: z.string(),
      reason: z.string(),
      framework: z.enum(['PAR', 'CAR']).optional(),
      needs_metric: z.boolean().optional(),
      metric_question: z.string().optional(),
    })).optional(),
    reordered_skills: z.array(z.string()).optional(),
    length_guidance: z.object({
      recommended_pages: z.union([z.literal(1), z.literal(2)]),
      reason: z.string(),
    }).optional(),
    seniority_match: z.object({
      candidate_level: z.string(),
      target_level: z.string(),
      gap_note: z.string(),
    }).optional(),
    red_flags: z.array(z.object({
      type: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      explanation: z.string(),
      action: z.string(),
    })).optional(),
    ats_family: z.string().optional(),
    portfolio_suggestion: z.object({
      needed: z.boolean(),
      reason: z.string(),
      suggestion: z.string(),
    }).optional(),
  }),
  original_score: z.number().int().min(0).max(100),
  tailored_score: z.number().int().min(0).max(100),
  ats_check: z.record(z.string(), z.unknown()).nullable().optional(),
  tone_check: z.record(z.string(), z.unknown()).nullable().optional(),
});

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = analysisActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }

    const { analysis_id, application_id } = parsed.data;
    const currentMonth = CURRENT_MONTH();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json({ error: 'Failed to load plan details' }, { status: 500 });
    }

    const rawPlan = (profile?.plan || 'free') as Plan;
    const plan = getEffectivePlan(rawPlan, profile?.subscription_status);
    const limits = getPlanLimits(plan);

    let usedTailoring = 0;

    try {
      const usageReservation = await reserveMonthlyUsage(supabase, 'tailoring', limits.tailoring_per_month, currentMonth);
      usedTailoring = usageReservation.used;

      if (!usageReservation.allowed) {
        return NextResponse.json(
          {
            error: `Free plan limit reached (${limits.tailoring_per_month} tailorings/month). Upgrade to Pro.`,
            upgrade_required: true,
            limit: limits.tailoring_per_month,
            used: usageReservation.used,
          },
          { status: 403 }
        );
      }
    } catch (usageError) {
      console.error('Tailoring usage reservation error:', usageError);
      return NextResponse.json({ error: 'Failed to reserve usage' }, { status: 500 });
    }

    const releaseReservedUsage = async () => {
      try {
        await releaseMonthlyUsage(supabase, 'tailoring', currentMonth);
      } catch (releaseError) {
        console.error('Tailoring usage release error:', releaseError);
      }
    };

    const [analysisResponse, resumeResponse] = await Promise.all([
      supabase
        .from('job_analyses')
        .select('id, overall_score, verdict, matched_skills, skill_gaps, recruiter_concerns, seniority_analysis, job_title, company, location, employment_type, job_description_raw, job_url')
        .eq('id', analysis_id)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('resumes')
        .select('parsed_data')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle(),
    ]);

    const { data: analysis, error: analysisError } = analysisResponse;
    const { data: resume, error: resumeError } = resumeResponse;

    if (analysisError || !analysis) {
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (resumeError) {
      console.error('Resume lookup error:', resumeError);
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Failed to load active resume' }, { status: 500 });
    }

    if (!resume?.parsed_data) {
      await releaseReservedUsage();
      return NextResponse.json({ error: 'No active resume found. Upload a resume first.' }, { status: 400 });
    }

    try {
      const atsFamily = detectAtsFamily(analysis.job_url);
      const redFlags = scanResumeRedFlags(resume.parsed_data as Record<string, unknown>);

      const result = await generateJSON<{
        tailored_summary: string;
        tailored_bullets: { original: string; tailored: string; reason: string; framework?: 'PAR' | 'CAR'; needs_metric?: boolean; metric_question?: string }[];
        reordered_skills: string[];
        ats_check: { passed: boolean; issues: string[]; keywords_matched: string[]; keywords_missing?: string[] };
        tone_check: { passed: boolean; flags: string[] };
        length_guidance?: { recommended_pages: 1 | 2; reason: string };
        seniority_match?: { candidate_level: string; target_level: string; gap_note: string };
        portfolio_suggestion?: { needed: boolean; reason: string; suggestion: string };
        estimated_score_improvement: number;
      }>(buildTailoringPrompt(resume.parsed_data as Record<string, unknown>, analysis, { ats_family: atsFamily, job_url: analysis.job_url }));

      const enrichedContent = {
        ...result,
        red_flags: redFlags,
        ats_family: atsFamily,
      };

      let tailored;

      try {
        tailored = await createTailoredResumeVersionRecord(supabase, {
          applicationId: application_id,
          analysisId: analysis_id,
          content: enrichedContent,
          originalScore: analysis.overall_score,
          tailoredScore: Math.min(100, analysis.overall_score + result.estimated_score_improvement),
          atsCheck: result.ats_check,
          toneCheck: result.tone_check,
        });
      } catch (saveError) {
        console.error('Tailored resume save error:', saveError);
        await releaseReservedUsage();
        return NextResponse.json({ error: 'Failed to save tailored resume' }, { status: 500 });
      }

      return NextResponse.json({
        data: {
          ...tailored,
          usage: {
            used: usedTailoring,
            limit: limits.tailoring_per_month,
          },
        },
      });
    } catch (generationError) {
      console.error('Tailor error:', generationError);
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Failed to generate tailored resume' }, { status: 500 });
    }
  } catch (error) {
    console.error('Tailor error:', error);
    logAiError({ route: '/api/tailor', error }).catch(() => {});
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = tailoredResumeSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }

    const { application_id, analysis_id, content, original_score, tailored_score, ats_check, tone_check } = parsed.data;

    let tailored;

    try {
      tailored = await createTailoredResumeVersionRecord(supabase, {
        applicationId: application_id,
        analysisId: analysis_id,
        content,
        originalScore: original_score,
        tailoredScore: tailored_score,
        atsCheck: ats_check || {},
        toneCheck: tone_check || {},
      });
    } catch (saveError) {
      console.error('Tailored resume save error:', saveError);
      return NextResponse.json({ error: 'Failed to save tailored resume' }, { status: 500 });
    }

    return NextResponse.json({ data: tailored });
  } catch (error) {
    console.error('Tailor save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
