import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin, writeAuditLog } from '@/lib/admin/service';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['free', 'pro', 'premium']),
  subscription_status: z.enum(['active', 'trialing', 'past_due', 'canceled']).nullable(),
  reason: z.string().trim().min(3).max(300),
});

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;

  // Verify caller is an admin
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await verifyAdmin(adminUser.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Validate body
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
  }

  const { plan, subscription_status, reason } = parsed.data;
  const serviceClient = await createServiceClient();

  // Fetch current plan for diff
  const { data: before } = await serviceClient
    .from('profiles')
    .select('plan, subscription_status')
    .eq('id', targetUserId)
    .single();

  if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Apply the update
  const { error: updateError } = await serviceClient
    .from('profiles')
    .update({ plan, subscription_status })
    .eq('id', targetUserId);

  if (updateError) {
    console.error('Admin repair-plan error:', updateError);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }

  // Write audit log
  await writeAuditLog({
    adminId: adminUser.id,
    targetUserId,
    action: 'repair_plan',
    diff: {
      before: { plan: before.plan, subscription_status: before.subscription_status },
      after: { plan, subscription_status },
    },
    reason,
    ip: getIp(request),
  });

  return NextResponse.json({ success: true });
}
