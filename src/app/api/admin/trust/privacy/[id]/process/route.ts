import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin, writeAuditLog } from '@/lib/admin/service';
import { z } from 'zod';

const schema = z.object({
  resolution: z.enum(['complete', 'rejected']),
  notes: z.string().max(500).optional(),
});

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params;

  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await verifyAdmin(adminUser.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
  }

  const { resolution, notes } = parsed.data;
  const serviceClient = await createServiceClient();

  const { data: req } = await serviceClient
    .from('privacy_requests')
    .select('id, user_id, user_email, type, status')
    .eq('id', requestId)
    .single();

  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  if (req.status !== 'pending' && req.status !== 'processing') {
    return NextResponse.json({ error: 'Request is already resolved' }, { status: 409 });
  }

  const { error: updateError } = await serviceClient
    .from('privacy_requests')
    .update({
      status: resolution,
      processed_at: new Date().toISOString(),
      processed_by: adminUser.id,
      notes: notes ?? null,
    })
    .eq('id', requestId);

  if (updateError) {
    console.error('Privacy request process error:', updateError);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }

  await writeAuditLog({
    adminId: adminUser.id,
    targetUserId: req.user_id ?? undefined,
    action: `privacy_request_${resolution}`,
    diff: { request_id: requestId, type: req.type, user_email: req.user_email, resolution },
    reason: notes || resolution,
    ip: getIp(request),
  });

  return NextResponse.json({ success: true });
}
