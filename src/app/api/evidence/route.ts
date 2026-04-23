import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildEvidenceExtractionPrompt, type EvidenceUnit } from '@/lib/gemini/prompts/evidence-extraction';
import { getEffectivePlan, isPremiumPlan, type Plan } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reserveAiBudget, refundAiBudget } from '@/lib/ai-token-budget';
import { logAiError } from '@/lib/admin/log-ai-error';

const createSchema = z.object({
  action: z.literal('create'),
  title: z.string().min(1).max(200),
  category: z.enum(['achievement', 'project', 'leadership', 'technical', 'stakeholder', 'problem-solving', 'failure_recovery']),
  situation: z.string().max(2000).optional(),
  action_taken: z.string().max(2000).optional(),
  result: z.string().max(2000).optional(),
  metrics: z.array(z.string().max(200)).max(10).optional(),
  skills: z.array(z.string().max(100)).max(20).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  best_used_for: z.array(z.string().max(50)).max(5).optional(),
  relevant_roles: z.array(z.string().max(100)).max(10).optional(),
  confidence: z.number().min(0).max(100).optional(),
});

const extractSchema = z.object({
  action: z.literal('extract'),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  category: z.enum(['achievement', 'project', 'leadership', 'technical', 'stakeholder', 'problem-solving', 'failure_recovery']).optional(),
  situation: z.string().max(2000).optional(),
  action_taken: z.string().max(2000).optional(),
  result: z.string().max(2000).optional(),
  metrics: z.array(z.string().max(200)).max(10).optional(),
  skills: z.array(z.string().max(100)).max(20).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  confidence: z.number().min(0).max(100).optional(),
  needs_clarification: z.boolean().optional(),
});

async function requirePremium(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status')
    .single();

  const plan = getEffectivePlan(profile?.plan as Plan, profile?.subscription_status);
  if (!isPremiumPlan(plan)) {
    return { allowed: false, plan };
  }
  return { allowed: true, plan };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: items, error } = await supabase
    .from('evidence_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to load evidence items' }, { status: 500 });
  return NextResponse.json({ data: items || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed, plan } = await requirePremium(supabase);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Evidence Vault requires a Premium plan.', upgrade_required: true },
      { status: 403 }
    );
  }

  const body = await request.json();

  // Manual item creation
  if (body.action === 'create') {
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    const { title, category, situation, action_taken, result, metrics, skills, tags, best_used_for, relevant_roles, confidence } = parsed.data;
    const { data: item, error } = await supabase
      .from('evidence_items')
      .insert({
        user_id: user.id,
        title,
        category,
        situation: situation || null,
        action_taken: action_taken || null,
        result: result || null,
        metrics: metrics || [],
        skills: skills || [],
        tags: tags || [],
        best_used_for: best_used_for || [],
        relevant_roles: relevant_roles || [],
        confidence: confidence ?? 80,
        needs_clarification: false,
        questions_to_improve: [],
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    return NextResponse.json({ data: item });
  }

  // AI extraction from resume
  if (body.action === 'extract') {
    extractSchema.safeParse(body);

    const budget = await reserveAiBudget(user.id, plan!, 'interview_prep');
    if (!budget.allowed) {
      return NextResponse.json({ error: budget.reason || 'Daily AI budget reached.' }, { status: 429 });
    }

    const { data: resume } = await supabase
      .from('resumes')
      .select('parsed_data')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!resume?.parsed_data) {
      await refundAiBudget(user.id, 'interview_prep');
      return NextResponse.json(
        { error: 'No parsed resume found. Upload and process your resume first.' },
        { status: 400 }
      );
    }

    try {
      const extracted = await generateJSON<{ evidence_units: EvidenceUnit[] }>(
        buildEvidenceExtractionPrompt(resume.parsed_data as Record<string, unknown>)
      );

      const units = extracted.evidence_units || [];
      if (units.length === 0) {
        await refundAiBudget(user.id, 'interview_prep');
        return NextResponse.json({ error: 'No evidence units could be extracted from your resume.' }, { status: 422 });
      }

      const rows = units.map((u) => ({
        user_id: user.id,
        story_id: u.story_id || null,
        title: u.title,
        category: u.category,
        situation: u.situation || null,
        action_taken: u.action || null,
        result: u.result || null,
        metrics: u.metrics || [],
        skills: u.skills || [],
        best_used_for: u.best_used_for || [],
        relevant_roles: u.relevant_roles || [],
        confidence: u.confidence ?? 80,
        needs_clarification: u.needs_clarification ?? false,
        questions_to_improve: u.questions_to_improve || [],
        tags: [],
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('evidence_items')
        .insert(rows)
        .select();

      if (insertError) {
        await refundAiBudget(user.id, 'interview_prep');
        return NextResponse.json({ error: 'Failed to save extracted items' }, { status: 500 });
      }

      return NextResponse.json({ data: inserted, count: inserted?.length || 0 });
    } catch (genError) {
      await refundAiBudget(user.id, 'interview_prep');
      logAiError({ userId: user.id, route: '/api/evidence', error: genError }).catch(() => {});
      return NextResponse.json({ error: 'Failed to extract evidence from resume' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed } = await requirePremium(supabase);
  if (!allowed) return NextResponse.json({ error: 'Premium required' }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { id, ...fields } = parsed.data;
  const updatePayload: Record<string, unknown> = {};
  if (fields.title !== undefined) updatePayload.title = fields.title;
  if (fields.category !== undefined) updatePayload.category = fields.category;
  if (fields.situation !== undefined) updatePayload.situation = fields.situation;
  if (fields.action_taken !== undefined) updatePayload.action_taken = fields.action_taken;
  if (fields.result !== undefined) updatePayload.result = fields.result;
  if (fields.metrics !== undefined) updatePayload.metrics = fields.metrics;
  if (fields.skills !== undefined) updatePayload.skills = fields.skills;
  if (fields.tags !== undefined) updatePayload.tags = fields.tags;
  if (fields.confidence !== undefined) updatePayload.confidence = fields.confidence;
  if (fields.needs_clarification !== undefined) updatePayload.needs_clarification = fields.needs_clarification;

  const { data: item, error } = await supabase
    .from('evidence_items')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  return NextResponse.json({ data: item });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed } = await requirePremium(supabase);
  if (!allowed) return NextResponse.json({ error: 'Premium required' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('evidence_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  return NextResponse.json({ success: true });
}
