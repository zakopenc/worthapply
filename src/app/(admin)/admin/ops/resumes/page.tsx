import { createServiceClient } from '@/lib/supabase/server';
import { RetryButton } from './RetryButton';
import styles from '../ops.module.css';

type ResumeRow = {
  id: string;
  user_id: string;
  filename: string | null;
  parse_status: string;
  created_at: string;
  email: string;
};

async function getResumes(status: string): Promise<ResumeRow[]> {
  const supabase = await createServiceClient();

  const statusFilter = status === 'pending'
    ? ['pending', 'processing']
    : ['failed'];

  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, user_id, filename, parse_status, created_at')
    .in('parse_status', statusFilter)
    .order('created_at', { ascending: false })
    .limit(100);

  if (!resumes?.length) return [];

  // Batch-fetch emails
  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map((authList?.users ?? []).map(u => [u.id, u.email ?? '']));

  return resumes.map(r => ({
    ...r,
    email: emailMap.get(r.user_id) ?? r.user_id,
  }));
}

export default async function FailedResumesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'failed' } = await searchParams;
  const resumes = await getResumes(status);
  const isPending = status === 'pending';

  return (
    <div>
      <div className={styles.backRow}>
        <a href="/admin/ops" className={styles.backLink}>← Ops Overview</a>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Resume Queue</h1>
      </div>

      <div className={styles.tabs}>
        <a href="/admin/ops/resumes" className={`${styles.tab} ${!isPending ? styles.tabActive : ''}`}>
          Failed
        </a>
        <a href="/admin/ops/resumes?status=pending" className={`${styles.tab} ${isPending ? styles.tabActive : ''}`}>
          Pending / Processing
        </a>
      </div>

      {resumes.length === 0 ? (
        <div className={styles.empty}>No {isPending ? 'pending' : 'failed'} resumes.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Filename</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resumes.map(r => (
                <tr key={r.id}>
                  <td>
                    <a href={`/admin/users/${r.user_id}`} className={styles.muted} style={{ textDecoration: 'none' }}>
                      {r.email}
                    </a>
                  </td>
                  <td className={styles.truncate}>{r.filename || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${r.parse_status === 'failed' ? styles.failed : styles.pending}`}>
                      {r.parse_status}
                    </span>
                  </td>
                  <td className={styles.muted}>
                    {new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <RetryButton resumeId={r.id} />
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
