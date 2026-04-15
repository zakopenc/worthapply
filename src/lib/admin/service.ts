import { createServiceClient } from '@/lib/supabase/server';

export type AdminRole = 'owner' | 'support';

/**
 * Verify a user is an admin. Returns their role or null if not an admin.
 * Uses the service client so RLS does not interfere.
 */
export async function verifyAdmin(userId: string): Promise<AdminRole | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  if (error) console.error('[verifyAdmin] query error:', error.code, error.message);
  if (!data) console.error('[verifyAdmin] no row found for userId:', userId);
  return data ? (data.role as AdminRole) : null;
}

/**
 * Write an entry to the admin audit log.
 * Errors are logged but never thrown — a logging failure must not block the action.
 */
export async function writeAuditLog(params: {
  adminId: string;
  targetUserId?: string;
  action: string;
  diff?: Record<string, unknown>;
  reason?: string;
  ip?: string;
}) {
  const supabase = await createServiceClient();
  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: params.adminId,
    target_user_id: params.targetUserId ?? null,
    action: params.action,
    diff: params.diff ?? null,
    reason: params.reason ?? null,
    ip: params.ip ?? null,
  });
  if (error) {
    console.error('Audit log write failed:', error);
  }
}
