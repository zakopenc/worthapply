import { createServiceClient } from '@/lib/supabase/server';
import styles from '../trust.module.css';

type FlaggedUser = {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  account_status: string;
};

async function getFlaggedUsers(status: string): Promise<FlaggedUser[]> {
  const supabase = await createServiceClient();

  const validStatuses = status === 'suspended' ? ['suspended'] : ['flagged'];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, plan, account_status')
    .in('account_status', validStatuses)
    .order('id');

  if (!profiles?.length) return [];

  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map((authList?.users ?? []).map(u => [u.id, u.email ?? '']));

  return profiles.map(p => ({
    id: p.id,
    email: emailMap.get(p.id) ?? '',
    full_name: p.full_name,
    plan: p.plan,
    account_status: p.account_status,
  }));
}

function statusClass(s: string) {
  if (s === 'suspended') return styles.suspended;
  if (s === 'flagged')   return styles.flagged;
  return styles.active;
}

export default async function FlagsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'flagged' } = await searchParams;
  const users = await getFlaggedUsers(status);

  return (
    <div>
      <div className={styles.backRow}>
        <a href="/admin/trust" className={styles.backLink}>← Trust Overview</a>
      </div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Flagged & Suspended Accounts</h1>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e5e5e5', paddingBottom: 0 }}>
        {[['flagged', 'Flagged'], ['suspended', 'Suspended']].map(([s, label]) => (
          <a
            key={s}
            href={`/admin/trust/flags?status=${s}`}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: status === s ? '#1a1a2e' : '#888',
              textDecoration: 'none',
              borderBottom: status === s ? '2px solid #1a1a2e' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
          </a>
        ))}
      </div>

      {users.length === 0 ? (
        <div className={styles.empty}>No {status} accounts.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className={styles.bold}>{u.full_name || '—'}</span>
                      <span className={styles.muted}>{u.email}</span>
                    </div>
                  </td>
                  <td className={styles.muted}>{u.plan}</td>
                  <td>
                    <span className={`${styles.badge} ${statusClass(u.account_status)}`}>
                      {u.account_status}
                    </span>
                  </td>
                  <td>
                    <a href={`/admin/users/${u.id}`} style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', textDecoration: 'none' }}>
                      Manage →
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
