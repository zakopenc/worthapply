import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildOfferEvaluationPrompt } from '@/lib/gemini/prompts/offer-evaluation';
import { getEffectivePlan, isPremiumPlan, type Plan } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, buildRateLimitErrorBody } from '@/lib/ratelimit';
import { reserveAiBudget, refundAiBudget } from '@/lib/ai-token-budget';
import { logAiError } from '@/lib/admin/log-ai-error';
import { z } from 'zod';

const generateSchema = z.object({
  application_id: z.string().uuid().optional(),
  offer_text: z.string().max(20000).optional(),
  structured_offer: z.record(z.string(), z.unknown()).optional(),
  role_context: z.object({
    job_title: z.string().max(200).optional(),
    company: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    seniority: z.string().max(50).optional(),
    remote: z.boolean().optional(),
  }).optional(),
  candidate_context: z.object({
    current_base: z.number().optional(),
    current_total_comp: z.number().optional(),
    years_experience: z.number().optional(),
    competing_offer_count: z.number().optional(),
    top_priorities: z.array(z.string().max(100)).max(10).optional(),
  }).optional(),
});

const saveSchema = z.object({
  evaluation_id: z.string().uuid(),
  parsed_offer: z.record(z.string(), z.unknown()).optional(),
  projection: z.record(z.string(), z.unknown()).optional(),
  negotiation: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
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

    const { application_id, offer_text, structured_offer, role_context, candidate_context } = parsed.data;

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, subscription_status')
      .eq('id', user.id)
      .single();
    const rawPlan = (profile?.plan || 'free') as Plan;
    const plan = getEffectivePlan(rawPlan, profile?.subscription_status);
    if (!isPremiumPlan(plan)) {
      return NextResponse.json({ error: 'Offer Evaluation is a Premium feature.', upgrade_required: true }, { status: 403 });
    }

    const rateLimit = await checkRateLimit(user.id, 'offer-evaluation', rawPlan);
    if (!rateLimit.success) {
      return NextResponse.json(
        buildRateLimitErrorBody(rateLimit, 'offer-evaluation'),
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const budget = await reserveAiBudget(user.id, plan, 'offer_evaluation');
    if (!budget.allowed) {
      return NextResponse.json(
        { error: budget.reason || 'Daily AI budget reached.', budget },
        { status: 429 }
      );
    }

    let analysisData: Record<string, unknown> | null = null;
    let resumeData: Record<string, unknown> | null = null;

    if (application_id) {
      const [{ data: app }, { data: resume }] = await Promise.all([
        supabase
          .from('applications')
          .select('id, job_title, company, location, analysis_id')
          .eq('id', application_id)
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('resumes')
          .select('parsed_data')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle(),
      ]);
      resumeData = (resume?.parsed_data as Record<string, unknown> | null) || null;
      if (app?.analysis_id) {
        const { data: analysis } = await supabase
          .from('job_analyses')
          .select('id, job_title, company, location, employment_type, overall_score, verdict, matched_skills, skill_gaps, recruiter_concerns, seniority_analysis')
          .eq('id', app.analysis_id)
          .eq('user_id', user.id)
          .maybeSingle();
        analysisData = analysis || null;
      }
    } else {
      const { data: resume } = await supabase
        .from('resumes')
        .select('parsed_data')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      resumeData = (resume?.parsed_data as Record<string, unknown> | null) || null;
    }

    try {
      const result = await generateJSON<{
        headline: string;
        parsed_offer: Record<string, unknown>;
        four_year_projection: Record<string, unknown>;
        benchmark_analysis: Record<string, unknown>;
        negotiation_levers: Record<string, unknown>[];
        negotiation_script: Record<string, unknown>;
        common_mistakes_to_avoid: string[];
        decision_matrix: Record<string, unknown>;
        red_alerts: { alert: string; severity: string; action: string }[];
        next_steps: string[];
      }>(
        buildOfferEvaluationPrompt({
          offer_text: offer_text || null,
          structured_offer: structured_offer || null,
          role_context: role_context || {},
          candidate_context: candidate_context || {},
          analysis_data: analysisData,
          resume_data: resumeData,
        })
      );

      const metadata = {
        headline: result.headline,
        benchmark_analysis: result.benchmark_analysis,
        negotiation_levers: result.negotiation_levers,
        common_mistakes_to_avoid: result.common_mistakes_to_avoid,
        decision_matrix: result.decision_matrix,
        red_alerts: result.red_alerts,
        next_steps: result.next_steps,
        plan,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('offer_evaluations')
        .insert({
          user_id: user.id,
          application_id: application_id || null,
          offer_text: offer_text || null,
          parsed_offer: result.parsed_offer || {},
          projection: result.four_year_projection || {},
          negotiation: result.negotiation_script || {},
          metadata,
          version: 1,
        })
        .select('id, application_id, offer_text, parsed_offer, projection, negotiation, metadata, version, created_at')
        .single();

      if (insertErr || !inserted) {
        console.error('Offer evaluation save error:', insertErr);
        return NextResponse.json({ error: 'Failed to save offer evaluation' }, { status: 500 });
      }

      return NextResponse.json({ data: inserted });
    } catch (generationError) {
      console.error('Offer evaluation generation error:', generationError);
      await refundAiBudget(user.id, 'offer_evaluation');
      return NextResponse.json({ error: 'Failed to evaluate offer' }, { status: 500 });
    }
  } catch (error) {
    console.error('Offer evaluation error:', error);
    logAiError({ route: '/api/offer-evaluation', error }).catch(() => {});
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

    const { evaluation_id, parsed_offer, projection, negotiation, metadata } = parsed.data;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed_offer !== undefined) updates.parsed_offer = parsed_offer;
    if (projection !== undefined) updates.projection = projection;
    if (negotiation !== undefined) updates.negotiation = negotiation;
    if (metadata !== undefined) updates.metadata = metadata;

    const { data, error } = await supabase
      .from('offer_evaluations')
      .update(updates)
      .eq('id', evaluation_id)
      .eq('user_id', user.id)
      .select('id, application_id, offer_text, parsed_offer, projection, negotiation, metadata, version, created_at')
      .single();

    if (error || !data) {
      console.error('Offer evaluation update error:', error);
      return NextResponse.json({ error: 'Failed to save edits' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Offer evaluation save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
