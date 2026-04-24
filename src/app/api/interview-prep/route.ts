import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildInterviewPrepPrompt, type InterviewStage } from '@/lib/gemini/prompts/interview-prep';
import { getEffectivePlan, isPremiumPlan, type Plan } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, buildRateLimitErrorBody } from '@/lib/ratelimit';
import { reserveAiBudget, refundAiBudget } from '@/lib/ai-token-budget';
import { logAiError } from '@/lib/admin/log-ai-error';
import { z } from 'zod';

const INTERVIEW_STAGES: InterviewStage[] = [
  'phone_screen',
  'recruiter_screen',
  'hiring_manager',
  'technical',
  'behavioral',
  'onsite_loop',
  'executive',
  'culture_fit',
  'take_home',
];

const generateSchema = z.object({
  application_id: z.string().uuid(),
  analysis_id: z.string().uuid(),
  stage: z.enum(INTERVIEW_STAGES as [InterviewStage, ...InterviewStage[]]),
  interviewer_notes: z.string().max(5000).optional(),
});

const saveSchema = z.object({
  prep_id: z.string().uuid(),
  content: z.record(z.string(), z.unknown()),
  interviewer_notes: z.string().max(5000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }

    const { application_id, analysis_id, stage, interviewer_notes } = parsed.data;

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, subscription_status')
      .eq('id', user.id)
      .single();
    const rawPlan = (profile?.plan || 'free') as Plan;
    const plan = getEffectivePlan(rawPlan, profile?.subscription_status);
    if (!isPremiumPlan(plan)) {
      return NextResponse.json({ error: 'Interview Prep Studio is a Premium feature.', upgrade_required: true }, { status: 403 });
    }

    const rateLimit = await checkRateLimit(user.id, 'interview-prep', plan);
    if (!rateLimit.success) {
      return NextResponse.json(
        buildRateLimitErrorBody(rateLimit, 'interview-prep'),
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const budget = await reserveAiBudget(user.id, plan, 'interview_prep');
    if (!budget.allowed) {
      return NextResponse.json(
        { error: budget.reason || 'Daily AI budget reached.', budget },
        { status: 429 }
      );
    }

    const [analysisResp, resumeResp, tailoredResp] = await Promise.all([
      supabase
        .from('job_analyses')
        .select('id, job_title, company, location, employment_type, overall_score, verdict, matched_skills, skill_gaps, recruiter_concerns, seniority_analysis, job_description_raw, job_url')
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

    if (analysisResp.error || !analysisResp.data) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    type TailoredContent = { tailored_bullets?: { original: string; tailored: string }[] };
    const tailoredBullets = (tailoredResp.data?.content as TailoredContent | null)?.tailored_bullets || null;

    try {
      const result = await generateJSON<Record<string, unknown>>(
        buildInterviewPrepPrompt(
          analysisResp.data,
          (resumeResp.data?.parsed_data as Record<string, unknown> | null) || null,
          {
            stage,
            interviewer_notes: interviewer_notes || null,
            tailored_bullets: tailoredBullets,
          }
        )
      );

      const { data: inserted, error: insertErr } = await supabase
        .from('interview_preps')
        .insert({
          user_id: user.id,
          application_id,
          analysis_id,
          interview_stage: stage,
          interviewer_notes: interviewer_notes || null,
          content: result,
          metadata: { plan },
          version: 1,
        })
        .select('id, application_id, analysis_id, interview_stage, interviewer_notes, content, metadata, version, created_at')
        .single();

      if (insertErr || !inserted) {
        console.error('Interview prep save error:', insertErr);
        return NextResponse.json({ error: 'Failed to save interview prep' }, { status: 500 });
      }

      return NextResponse.json({ data: inserted });
    } catch (generationError) {
      console.error('Interview prep generation error:', generationError);
      await refundAiBudget(user.id, 'interview_prep');
      return NextResponse.json({ error: 'Failed to generate interview prep' }, { status: 500 });
    }
  } catch (error) {
    console.error('Interview prep error:', error);
    logAiError({ route: '/api/interview-prep', error }).catch(() => {});
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }

    const { prep_id, content, interviewer_notes } = parsed.data;

    const { data, error } = await supabase
      .from('interview_preps')
      .update({
        content,
        interviewer_notes: interviewer_notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', prep_id)
      .eq('user_id', user.id)
      .select('id, application_id, analysis_id, interview_stage, interviewer_notes, content, metadata, version, created_at')
      .single();

    if (error || !data) {
      console.error('Interview prep update error:', error);
      return NextResponse.json({ error: 'Failed to save edits' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Interview prep save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
