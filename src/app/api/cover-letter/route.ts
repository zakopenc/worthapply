import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildCoverLetterTriagePrompt, type IndustryPreset, type StructureFormat } from '@/lib/gemini/prompts/cover-letter';
import { getPlanLimits, isPaidPlan, getEffectivePlan, type Plan } from '@/lib/plans';
import { analysisActionSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';
import { CURRENT_MONTH, releaseMonthlyUsage, reserveMonthlyUsage } from '@/lib/usage-tracking';
import { createCoverLetterVersionRecord } from '@/lib/versioned-workspace-records';
import { checkRateLimit, buildRateLimitErrorBody } from '@/lib/ratelimit';
import { reserveAiBudget, refundAiBudget } from '@/lib/ai-token-budget';
import { logAiError } from '@/lib/admin/log-ai-error';
import { z } from 'zod';

const coverLetterGenerateSchema = analysisActionSchema.extend({
  industry_preset: z.enum([
    'tech_startup',
    'enterprise_tech',
    'finance_law',
    'academia',
    'nonprofit',
    'creative',
    'public_sector',
    'general',
  ]).optional(),
  user_company_signal: z.string().max(2000).optional(),
});

const coverLetterSaveSchema = z.object({
  application_id: z.string().uuid({ message: 'Invalid application ID' }),
  analysis_id: z.string().uuid({ message: 'Invalid analysis ID' }),
  recommendation: z.enum(['skip', 'short-note', 'full-letter']),
  content: z.string(),
  email_body_content: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = coverLetterGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }

    const { analysis_id, application_id, industry_preset, user_company_signal } = parsed.data;
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
    const hasFullCoverLetterAccess = isPaidPlan(plan);

    // Plan-tiered rate limit (burst guard) — free: 10/min, pro: 60/min, premium: 120/min.
    const rateLimit = await checkRateLimit(user.id, 'cover-letter', plan);
    if (!rateLimit.success) {
      return NextResponse.json(
        buildRateLimitErrorBody(rateLimit, 'cover-letter'),
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    // Only consume AI budget for plans that actually generate a full letter.
    // Free-plan verdicts are computed deterministically — no AI call.
    if (hasFullCoverLetterAccess) {
      const budget = await reserveAiBudget(user.id, plan, 'cover_letter');
      if (!budget.allowed) {
        return NextResponse.json(
          { error: budget.reason || 'Daily AI budget reached.', upgrade_required: false, budget },
          { status: 429 }
        );
      }
    }

    let usedCoverLetters = 0;

    try {
      const usageReservation = await reserveMonthlyUsage(supabase, 'cover_letters', limits.cover_letters_per_month, currentMonth);
      usedCoverLetters = usageReservation.used;

      if (!usageReservation.allowed) {
        return NextResponse.json(
          {
            error: `Plan limit reached (${limits.cover_letters_per_month} cover letters/month).`,
            upgrade_required: true,
            limit: limits.cover_letters_per_month,
            used: usageReservation.used,
          },
          { status: 403 }
        );
      }
    } catch (usageError) {
      console.error('Cover letter usage reservation error:', usageError);
      return NextResponse.json({ error: 'Failed to reserve usage' }, { status: 500 });
    }

    const releaseReservedUsage = async () => {
      try {
        await releaseMonthlyUsage(supabase, 'cover_letters', currentMonth);
      } catch (releaseError) {
        console.error('Cover letter usage release error:', releaseError);
      }
    };

    const [analysisResponse, resumeResponse, tailoredResponse] = await Promise.all([
      supabase
        .from('job_analyses')
        .select('id, job_title, company, location, employment_type, overall_score, verdict, matched_skills, skill_gaps, recruiter_concerns, seniority_analysis, job_description_raw')
        .eq('id', analysis_id)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('resumes')
        .select('parsed_data')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle(),
      supabase
        .from('tailored_resumes')
        .select('content')
        .eq('application_id', application_id)
        .eq('user_id', user.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const { data: analysis, error: analysisError } = analysisResponse;
    const { data: resume, error: resumeError } = resumeResponse;
    const { data: latestTailored } = tailoredResponse;

    if (analysisError || !analysis) {
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (resumeError) {
      console.error('Cover letter resume lookup error:', resumeError);
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Failed to load active resume' }, { status: 500 });
    }

    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', application_id)
      .eq('user_id', user.id)
      .single();

    if (applicationError || !application) {
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    try {
      const fallbackRecommendation = (() => {
        if (analysis.verdict === 'apply') {
          return (analysis.overall_score || 0) >= 80 ? 'skip' : 'short-note';
        }

        if (analysis.verdict === 'low-priority') {
          return 'short-note';
        }

        return 'full-letter';
      })();

      const fallbackReasoning = (() => {
        if (fallbackRecommendation === 'skip') {
          return 'This role already looks like a strong fit, so a cover letter is likely optional unless the employer explicitly asks for one.';
        }

        if (fallbackRecommendation === 'short-note') {
          return 'A concise cover note can reinforce your strongest match points without over-investing extra time.';
        }

        return 'This role may need more narrative context, so a full cover letter would help frame your strengths and address likely questions.';
      })();

      type TailoredContent = { tailored_bullets?: { original: string; tailored: string }[] };
      const tailoredBullets = (latestTailored?.content as TailoredContent | null)?.tailored_bullets || null;

      const result = hasFullCoverLetterAccess
        ? await generateJSON<{
            recommendation: 'skip' | 'short-note' | 'full-letter';
            reasoning: string;
            content: string;
            email_body_content: string;
            structure_format: StructureFormat;
            tone_preset_used: IndustryPreset;
            opener_type: 'accomplishment' | 'referral' | 'company_observation' | 'none';
            concerns_addressed: string[];
            needs_company_signal: boolean;
            company_signal_question: string;
            ai_tell_flags: string[];
            key_points_addressed: string[];
          }>(
            buildCoverLetterTriagePrompt(analysis, (resume?.parsed_data as Record<string, unknown> | null) || null, {
              industry_preset: industry_preset || 'general',
              user_company_signal: user_company_signal || null,
              tailored_bullets: tailoredBullets,
            })
          )
        : {
            recommendation: fallbackRecommendation as 'skip' | 'short-note' | 'full-letter',
            reasoning: fallbackReasoning,
            content: '',
            email_body_content: '',
            structure_format: 'problem_solution' as StructureFormat,
            tone_preset_used: (industry_preset || 'general') as IndustryPreset,
            opener_type: 'none' as const,
            concerns_addressed: [],
            needs_company_signal: false,
            company_signal_question: '',
            ai_tell_flags: [],
            key_points_addressed: [],
          };

      const metadata = {
        structure_format: result.structure_format,
        tone_preset_used: result.tone_preset_used,
        opener_type: result.opener_type,
        concerns_addressed: result.concerns_addressed,
        needs_company_signal: result.needs_company_signal,
        company_signal_question: result.company_signal_question,
        ai_tell_flags: result.ai_tell_flags,
        key_points_addressed: result.key_points_addressed,
        user_company_signal: user_company_signal || '',
        reasoning: result.reasoning,
      };

      let coverLetter;

      try {
        coverLetter = await createCoverLetterVersionRecord(supabase, {
          applicationId: application_id,
          analysisId: analysis_id,
          recommendation: result.recommendation,
          content: hasFullCoverLetterAccess ? result.content : null,
          emailBodyContent: hasFullCoverLetterAccess ? result.email_body_content || null : null,
          metadata: hasFullCoverLetterAccess ? metadata : null,
        });
      } catch (saveError) {
        console.error('Cover letter save error:', saveError);
        await releaseReservedUsage();
        return NextResponse.json({ error: 'Failed to save cover letter' }, { status: 500 });
      }

      return NextResponse.json({
        data: {
          ...coverLetter,
          content: hasFullCoverLetterAccess ? result.content : '',
          email_body_content: hasFullCoverLetterAccess ? result.email_body_content : '',
          metadata: hasFullCoverLetterAccess ? metadata : null,
          reasoning: result.reasoning,
          plan,
          upgrade_required: !hasFullCoverLetterAccess,
          usage: {
            used: usedCoverLetters,
            limit: limits.cover_letters_per_month,
          },
        },
      });
    } catch (generationError) {
      console.error('Cover letter generation error:', generationError);
      await releaseReservedUsage();
      if (hasFullCoverLetterAccess) await refundAiBudget(user.id, 'cover_letter');
      return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
    }
  } catch (error) {
    console.error('Cover letter error:', error);
    logAiError({ route: '/api/cover-letter', error }).catch(() => {});
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = coverLetterSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }

    const { application_id, analysis_id, recommendation, content, email_body_content, metadata } = parsed.data;

    let coverLetter;
    try {
      coverLetter = await createCoverLetterVersionRecord(supabase, {
        applicationId: application_id,
        analysisId: analysis_id,
        recommendation,
        content,
        emailBodyContent: email_body_content ?? null,
        metadata: metadata ?? null,
      });
    } catch (saveError) {
      console.error('Cover letter save error:', saveError);
      return NextResponse.json({ error: 'Failed to save cover letter' }, { status: 500 });
    }

    return NextResponse.json({ data: coverLetter });
  } catch (error) {
    console.error('Cover letter save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
