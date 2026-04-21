import { createClient } from '@supabase/supabase-js';

/**
 * Force-signs-out a user from all active sessions.
 *
 * Intended to be called AFTER an admin role has been revoked — ensures the
 * now-former admin can't continue making admin-authenticated requests with
 * an existing session until its normal expiry.
 *
 * Also useful for:
 *   - Account compromise response (suspected credential leak)
 *   - GDPR deletion requests
 *   - Admin-initiated "kick user" action
 *
 * This uses the service-role key, so ONLY call from server-side code behind
 * an admin-verified route.
 *
 * Returns true on success, false if the service role key is missing or the
 * sign-out RPC errored.
 */
export async function invalidateUserSessions(userId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('[invalidateUserSessions] SUPABASE_SERVICE_ROLE_KEY missing — cannot sign user out');
    return false;
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { error } = await admin.auth.admin.signOut(userId);
    if (error) {
      console.error('[invalidateUserSessions] signOut error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[invalidateUserSessions] unexpected error:', error);
    return false;
  }
}
