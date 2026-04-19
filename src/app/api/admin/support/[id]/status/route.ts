import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin, writeAuditLog } from '@/lib/admin/service';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['open', 'closed']),
});

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;

  const supabase = await createClient();
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await verifyAdmin(adminUser.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
  }

  const { status } = parsed.data;
  const service = await createServiceClient();

  const { data: before, error: fetchErr } = await service
    .from('support_tickets')
    .select('id, user_id, status')
    .eq('id', ticketId)
    .maybeSingle();

  if (fetchErr || !before) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const { error: updateErr } = await service
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId);

  if (updateErr) {
    console.error('[support status]', updateErr);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  await writeAuditLog({
    adminId: adminUser.id,
    targetUserId: before.user_id,
    action: 'support_ticket_status',
    diff: { ticket_id: ticketId, before: before.status, after: status },
    ip: getIp(request),
  });

  return NextResponse.json({ ok: true });
}
