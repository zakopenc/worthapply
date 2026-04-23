import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildOutreachPrompt, type OutreachTargetType, type OutreachGoal } from '@/lib/gemini/prompts/outreach';
import { isPaidPlan, getEffectivePlan, type Plan } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, buildRateLimitErrorBody } from '@/lib/ratelimit';
import { reserveAiBudget, refundAiBudget } from '@/lib/ai-token-budget';
import { logAiError } from '@/lib/admin/log-ai-error';

const outreachSchema = z.object({
  analysis_id: z.string().uuid({ message: 'Invalid analysis ID' }),
  application_id: z.string().uuid({ message: 'Invalid application ID' }),
  target_type: z.enum(['recruiter', 'hiring_manager', 'employee_referral', 'alumni']),
  goal: z.enum(['ask_referral', 'introduce_candidacy', 'follow_up_after_applying', 'get_conversation']),
});

type OutreachResult = {
  suggest_outreach: boolean;
  why: string;
  best_target_order: string[];
  primary_message: string;
  follow_up_1: string;
  follow_up_2: string;
  risks_to_avoid: string[];
  best_time_to_send: string;
  confidence: number;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = outreachSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
    }

    const { analysis_id, target_type, goal } = parsed.data;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to load plan details' }, { status: 500 });
    }

    const plan = getEffectivePlan(profile?.plan as Plan, profile?.subscription_status);

    if (!isPaidPlan(plan)) {
      return NextResponse.json(
        { error: 'Outreach Copilot requires a Pro or Premium plan.', upgrade_required: true },
        { status: 403 }
      );
    }

    const rateLimit = await checkRateLimit(user.id, 'outreach', plan);
    if (!rateLimit.success) {
      return NextResponse.json(
        buildRateLimitErrorBody(rateLimit, 'outreach'),
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const budget = await reserveAiBudget(user.id, plan, 'outreach');
    if (!budget.allowed) {
      return NextResponse.json(
        { error: budget.reason || 'Daily AI budget reached.', upgrade_required: false, budget },
        { status: 429 }
      );
    }

    const [{ data: analysis }, { data: resume }] = await Promise.all([
      supabase
        .from('job_analyses')
        .select('job_title, company, job_description_raw, overall_score, verdict, matched_skills, skill_gaps')
        .eq('id', analysis_id)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('resumes')
        .select('parsed_data')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (!analysis) {
      await refundAiBudget(user.id, 'outreach');
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    try {
      const result = await generateJSON<OutreachResult>(
        buildOutreachPrompt({
          jobTitle: analysis.job_title,
          company: analysis.company,
          jobDescription: analysis.job_description_raw,
          fitScore: analysis.overall_score,
          verdict: analysis.verdict,
          matchedSkills: analysis.matched_skills || [],
          skillGaps: analysis.skill_gaps || [],
          resumeData: resume?.parsed_data as Record<string, unknown> | null,
          targetType: target_type as OutreachTargetType,
          goal: goal as OutreachGoal,
        })
      );

      return NextResponse.json({ data: result });
    } catch (genError) {
      await refundAiBudget(user.id, 'outreach');
      logAiError({ userId: user.id, route: '/api/outreach', error: genError }).catch(() => {});
      return NextResponse.json({ error: 'Failed to generate outreach plan' }, { status: 500 });
    }
  } catch (error) {
    console.error('Outreach error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
