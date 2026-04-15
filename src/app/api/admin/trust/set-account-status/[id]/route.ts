import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin, writeAuditLog } from '@/lib/admin/service';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['active', 'flagged', 'suspended']),
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

  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await verifyAdmin(adminUser.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Owners can suspend; support can only flag
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
  }

  const { status, reason } = parsed.data;

  if (status === 'suspended' && role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can suspend accounts' }, { status: 403 });
  }

  // Prevent self-flagging
  if (targetUserId === adminUser.id) {
    return NextResponse.json({ error: 'Cannot change your own account status' }, { status: 400 });
  }

  const serviceClient = await createServiceClient();

  const { data: before } = await serviceClient
    .from('profiles')
    .select('account_status')
    .eq('id', targetUserId)
    .single();

  if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { error: updateError } = await serviceClient
    .from('profiles')
    .update({ account_status: status })
    .eq('id', targetUserId);

  if (updateError) {
    console.error('Admin set-account-status error:', updateError);
    return NextResponse.json({ error: 'Failed to update account status' }, { status: 500 });
  }

  await writeAuditLog({
    adminId: adminUser.id,
    targetUserId,
    action: 'set_account_status',
    diff: { before: before.account_status, after: status },
    reason,
    ip: getIp(request),
  });

  return NextResponse.json({ success: true });
}
