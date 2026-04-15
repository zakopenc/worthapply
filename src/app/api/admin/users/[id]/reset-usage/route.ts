import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin, writeAuditLog } from '@/lib/admin/service';
import { z } from 'zod';

const RESOURCE_TYPES = ['analyses', 'tailoring', 'cover_letters', 'job_scrapes'] as const;

const schema = z.object({
  resource_type: z.enum(RESOURCE_TYPES),
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

  const { resource_type, reason } = parsed.data;
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const serviceClient = await createServiceClient();

  // Fetch current value for diff
  const { data: before } = await serviceClient
    .from('monthly_usage')
    .select('used')
    .eq('user_id', targetUserId)
    .eq('resource_type', resource_type)
    .eq('period', currentMonth)
    .single();

  // Reset to 0 (upsert in case no row exists yet)
  const { error: updateError } = await serviceClient
    .from('monthly_usage')
    .upsert(
      { user_id: targetUserId, resource_type, period: currentMonth, used: 0 },
      { onConflict: 'user_id,resource_type,period' }
    );

  if (updateError) {
    console.error('Admin reset-usage error:', updateError);
    return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 });
  }

  await writeAuditLog({
    adminId: adminUser.id,
    targetUserId,
    action: 'reset_usage',
    diff: {
      resource_type,
      period: currentMonth,
      before: before?.used ?? 0,
      after: 0,
    },
    reason,
    ip: getIp(request),
  });

  return NextResponse.json({ success: true });
}
