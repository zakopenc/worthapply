import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin, writeAuditLog } from '@/lib/admin/service';
import { z } from 'zod';

const schema = z.object({
  reason: z.string().trim().min(3).max(300),
  confirm_email: z.string().email(),
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

  // Owner only — deletion is irreversible
  const role = await verifyAdmin(adminUser.id);
  if (role !== 'owner') return NextResponse.json({ error: 'Forbidden — owner only' }, { status: 403 });

  // Prevent self-deletion
  if (targetUserId === adminUser.id) {
    return NextResponse.json({ error: 'Cannot delete your own account via admin' }, { status: 400 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
  }

  const { reason, confirm_email } = parsed.data;

  const serviceClient = await createServiceClient();

  // Look up user to validate confirm_email matches
  const { data: authUser } = await serviceClient.auth.admin.getUserById(targetUserId);
  if (!authUser?.user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (authUser.user.email?.toLowerCase() !== confirm_email.toLowerCase()) {
    return NextResponse.json({ error: 'Confirmation email does not match' }, { status: 400 });
  }

  // Log before deletion (user_id will become null via SET NULL after delete)
  await writeAuditLog({
    adminId: adminUser.id,
    targetUserId,
    action: 'gdpr_delete_user',
    diff: { email: authUser.user.email, deleted_at: new Date().toISOString() },
    reason,
    ip: getIp(request),
  });

  // Hard-delete from Supabase Auth — cascades to profiles and all user data via FK
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(targetUserId);

  if (deleteError) {
    console.error('Admin delete-user error:', deleteError);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
