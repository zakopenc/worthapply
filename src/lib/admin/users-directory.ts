import { createServiceClient } from '@/lib/supabase/server';

export const USERS_PAGE_SIZE = 25;

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  subscription_status: string | null;
  onboarding_complete: boolean;
  created_at: string;
};

export type UsersDirectoryResult = {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Paginated user directory. Email search (contains @) returns at most one match, page 1.
 */
export async function getUsersDirectory(q: string | undefined, requestedPage: number): Promise<UsersDirectoryResult> {
  const supabase = await createServiceClient();
  const pageSize = USERS_PAGE_SIZE;

  const trimmed = q?.trim();

  if (trimmed?.includes('@')) {
    const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const authUser = authList?.users?.find(u => u.email?.toLowerCase() === trimmed.toLowerCase());
    if (!authUser) {
      return { users: [], total: 0, page: 1, pageSize, totalPages: 0 };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, plan, subscription_status, onboarding_complete, created_at')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      return { users: [], total: 0, page: 1, pageSize, totalPages: 0 };
    }

    const row: AdminUserRow = {
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: profile.full_name,
      plan: profile.plan,
      subscription_status: profile.subscription_status,
      onboarding_complete: profile.onboarding_complete,
      created_at: profile.created_at,
    };

    return { users: [row], total: 1, page: 1, pageSize, totalPages: 1 };
  }

  let countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
  if (trimmed) {
    countQuery = countQuery.ilike('full_name', `%${trimmed}%`);
  }
  const { count: totalCount } = await countQuery;
  const total = totalCount ?? 0;
  if (total === 0) {
    return { users: [], total: 0, page: 1, pageSize, totalPages: 0 };
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage || 1), totalPages);

  let pagedQuery = supabase
    .from('profiles')
    .select('id, full_name, plan, subscription_status, onboarding_complete, created_at')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (trimmed) {
    pagedQuery = pagedQuery.ilike('full_name', `%${trimmed}%`);
  }

  const { data: profiles } = await pagedQuery;

  if (!profiles?.length) {
    return { users: [], total, page, pageSize, totalPages };
  }

  const authResults = await Promise.all(profiles.map(p => supabase.auth.admin.getUserById(p.id)));
  const emailMap = new Map(authResults.map((r, i) => [profiles[i].id, r.data.user?.email ?? '']));

  const users: AdminUserRow[] = profiles.map(p => ({
    id: p.id,
    email: emailMap.get(p.id) ?? '',
    full_name: p.full_name,
    plan: p.plan,
    subscription_status: p.subscription_status,
    onboarding_complete: p.onboarding_complete,
    created_at: p.created_at,
  }));

  return { users, total, page, pageSize, totalPages };
}
