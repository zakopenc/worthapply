import { createServiceClient } from '@/lib/supabase/server';
import styles from '../trust.module.css';

type UsageRow = { user_id: string; resource_type: string; used: number };

type UserUsage = {
  user_id: string;
  email: string;
  plan: string;
  total: number;
  breakdown: Record<string, number>;
};

const RESOURCE_LABELS: Record<string, string> = {
  analyses:      'Analyses',
  tailoring:     'Tailoring',
  cover_letters: 'Cover Letters',
  job_scrapes:   'LinkedIn',
};

async function getTopUsers(): Promise<UserUsage[]> {
  const supabase = await createServiceClient();
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const { data: usage } = await supabase
    .from('monthly_usage')
    .select('user_id, resource_type, used')
    .eq('period', currentMonth)
    .order('used', { ascending: false });

  if (!usage?.length) return [];

  // Group by user_id
  const byUser: Record<string, { total: number; breakdown: Record<string, number> }> = {};
  for (const row of usage as UsageRow[]) {
    if (!byUser[row.user_id]) byUser[row.user_id] = { total: 0, breakdown: {} };
    byUser[row.user_id].total += row.used;
    byUser[row.user_id].breakdown[row.resource_type] = (byUser[row.user_id].breakdown[row.resource_type] ?? 0) + row.used;
  }

  // Sort by total, take top 30
  const topIds = Object.entries(byUser)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 30)
    .map(([id]) => id);

  if (!topIds.length) return [];

  const [{ data: profiles }, { data: authList }] = await Promise.all([
    supabase.from('profiles').select('id, plan').in('id', topIds),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const planMap  = new Map((profiles ?? []).map(p => [p.id, p.plan]));
  const emailMap = new Map((authList?.users ?? []).map(u => [u.id, u.email ?? '']));

  return topIds.map(id => ({
    user_id: id,
    email: emailMap.get(id) ?? id,
    plan: planMap.get(id) ?? 'unknown',
    total: byUser[id].total,
    breakdown: byUser[id].breakdown,
  }));
}

export default async function AbusePage() {
  const users = await getTopUsers();
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className={styles.backRow}>
        <a href="/admin/trust" className={styles.backLink}>← Trust Overview</a>
      </div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Usage Leaderboard</h1>
        <span style={{ fontSize: 13, color: '#888' }}>{currentMonth}</span>
      </div>

      {users.length === 0 ? (
        <div className={styles.empty}>No usage data this month.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Plan</th>
                <th>Total</th>
                {Object.keys(RESOURCE_LABELS).map(r => (
                  <th key={r}>{RESOURCE_LABELS[r]}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.user_id}>
                  <td className={styles.muted}>{i + 1}</td>
                  <td className={styles.truncate}>{u.email}</td>
                  <td className={styles.muted}>{u.plan}</td>
                  <td className={styles.bold}>{u.total}</td>
                  {Object.keys(RESOURCE_LABELS).map(r => (
                    <td key={r} className={styles.muted}>{u.breakdown[r] ?? 0}</td>
                  ))}
                  <td>
                    <a href={`/admin/users/${u.user_id}`} style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', textDecoration: 'none' }}>
                      View →
                    </a>
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
