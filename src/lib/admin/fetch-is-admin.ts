import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * True if the user has a row in admin_roles. Requires RLS policy allowing
 * authenticated users to SELECT their own row (see migration admin_roles_self_read).
 */
export async function fetchIsAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[fetchIsAdmin]', error.code, error.message);
    return false;
  }

  return !!data;
}
