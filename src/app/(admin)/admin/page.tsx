import { createServiceClient } from '@/lib/supabase/server';
import styles from './page.module.css';

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  subscription_status: string | null;
  onboarding_complete: boolean;
  created_at: string;
};

async function getUsers(query?: string): Promise<AdminUser[]> {
  const supabase = await createServiceClient();

  if (query?.includes('@')) {
    // Search by email — listUsers + in-memory filter (getUserByEmail not available in this SDK version)
    const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const authUser = authList?.users?.find(u => u.email?.toLowerCase() === query.trim().toLowerCase());
    if (!authUser) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, plan, subscription_status, onboarding_complete, created_at')
      .eq('id', authUser.id)
      .single();

    if (!profile) return [];

    return [{
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: profile.full_name,
      plan: profile.plan,
      subscription_status: profile.subscription_status,
      onboarding_complete: profile.onboarding_complete,
      created_at: profile.created_at,
    }];
  }

  // Search by name or list recent 50 users
  let profileQuery = supabase
    .from('profiles')
    .select('id, full_name, plan, subscription_status, onboarding_complete, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (query) {
    profileQuery = profileQuery.ilike('full_name', `%${query}%`);
  }

  const { data: profiles } = await profileQuery;
  if (!profiles?.length) return [];

  // Batch-fetch emails from auth admin
  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map((authList?.users ?? []).map(u => [u.id, u.email ?? '']));

  return profiles.map(p => ({
    id: p.id,
    email: emailMap.get(p.id) ?? '',
    full_name: p.full_name,
    plan: p.plan,
    subscription_status: p.subscription_status,
    onboarding_complete: p.onboarding_complete,
    created_at: p.created_at,
  }));
}

function planBadgeClass(plan: string) {
  if (plan === 'premium' || plan === 'lifetime') return styles.badgePremium;
  if (plan === 'pro') return styles.badgePro;
  return styles.badgeFree;
}

function statusBadgeClass(status: string | null) {
  if (status === 'active' || status === 'trialing') return styles.badgeActive;
  if (status === 'past_due') return styles.badgePastDue;
  return styles.badgeNeutral;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await getUsers(q);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>User Management</h1>
        <span className={styles.count}>{users.length} result{users.length !== 1 ? 's' : ''}</span>
      </div>

      <form method="GET" action="/admin" className={styles.searchForm}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email or name…"
          className={styles.searchInput}
          autoComplete="off"
        />
        <button type="submit" className={styles.searchBtn}>Search</button>
        {q && (
          <a href="/admin" className={styles.clearBtn}>Clear</a>
        )}
      </form>

      {users.length === 0 ? (
        <p className={styles.empty}>
          {q ? `No users found matching "${q}".` : 'No users yet.'}
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Onboarded</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.userName}>{user.full_name || '—'}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${planBadgeClass(user.plan)}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${statusBadgeClass(user.subscription_status)}`}>
                      {user.subscription_status ?? 'none'}
                    </span>
                  </td>
                  <td className={styles.center}>
                    {user.onboarding_complete ? '✓' : '—'}
                  </td>
                  <td className={styles.muted}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <a href={`/admin/users/${user.id}`} className={styles.viewLink}>View →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
