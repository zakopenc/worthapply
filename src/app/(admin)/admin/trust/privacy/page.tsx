import { createServiceClient } from '@/lib/supabase/server';
import { NewPrivacyRequestForm, ProcessButton } from './PrivacyActions';
import styles from '../trust.module.css';

type PrivacyRequest = {
  id: string;
  user_id: string | null;
  user_email: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
};

async function getPrivacyRequests(status: string): Promise<PrivacyRequest[]> {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from('privacy_requests')
    .select('id, user_id, user_email, type, status, notes, created_at, processed_at')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100);

  return (data ?? []) as PrivacyRequest[];
}

function statusClass(s: string) {
  if (s === 'complete')   return styles.complete;
  if (s === 'rejected')   return styles.rejected;
  if (s === 'processing') return styles.flagged;
  return styles.pending;
}

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'pending' } = await searchParams;
  const requests = await getPrivacyRequests(status);

  return (
    <div>
      <div className={styles.backRow}>
        <a href="/admin/trust" className={styles.backLink}>← Trust Overview</a>
      </div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Privacy Requests</h1>
      </div>

      <NewPrivacyRequestForm />

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e5e5e5' }}>
        {['pending', 'complete', 'rejected'].map(s => (
          <a
            key={s}
            href={`/admin/trust/privacy?status=${s}`}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: status === s ? '#1a1a2e' : '#888',
              textDecoration: 'none',
              borderBottom: status === s ? '2px solid #1a1a2e' : '2px solid transparent',
              marginBottom: -1,
              textTransform: 'capitalize',
            }}
          >
            {s}
          </a>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className={styles.empty}>No {status} privacy requests.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 500 }}>{r.user_email}</span>
                      {r.user_id && (
                        <a href={`/admin/users/${r.user_id}`} className={styles.muted} style={{ textDecoration: 'none' }}>
                          {r.user_id.slice(0, 8)}…
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${r.type === 'delete' ? styles.suspended : styles.pending}`}>
                      {r.type}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${statusClass(r.status)}`}>{r.status}</span>
                  </td>
                  <td className={styles.muted}>{r.notes || '—'}</td>
                  <td className={styles.muted}>
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {r.status === 'pending' && (
                      <>
                        <ProcessButton requestId={r.id} resolution="complete" />
                        <ProcessButton requestId={r.id} resolution="rejected" />
                      </>
                    )}
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
