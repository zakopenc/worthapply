import { createServiceClient } from '@/lib/supabase/server';
import styles from '../ops.module.css';

type WebhookEvent = {
  id: string;
  stripe_event_id: string;
  type: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

async function getWebhookEvents(status?: string): Promise<WebhookEvent[]> {
  const supabase = await createServiceClient();

  let query = supabase
    .from('webhook_events')
    .select('id, stripe_event_id, type, status, error_message, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;
  return data ?? [];
}

function statusClass(status: string) {
  if (status === 'processed') return styles.processed;
  if (status === 'failed')    return styles.failed;
  return styles.ignored;
}

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'all' } = await searchParams;
  const events = await getWebhookEvents(status);

  return (
    <div>
      <div className={styles.backRow}>
        <a href="/admin/ops" className={styles.backLink}>← Ops Overview</a>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Stripe Webhook Events</h1>
      </div>

      <div className={styles.tabs}>
        {['all', 'processed', 'failed', 'ignored'].map(s => (
          <a
            key={s}
            href={`/admin/ops/webhooks?status=${s}`}
            className={`${styles.tab} ${status === s ? styles.tabActive : ''}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </a>
        ))}
      </div>

      {events.length === 0 ? (
        <div className={styles.empty}>No webhook events yet.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Error</th>
                <th>Stripe Event ID</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td className={styles.mono}>{e.type}</td>
                  <td>
                    <span className={`${styles.badge} ${statusClass(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className={styles.muted} style={{ maxWidth: 260 }}>
                    <span className={styles.truncate} style={{ display: 'block' }}>
                      {e.error_message || '—'}
                    </span>
                  </td>
                  <td className={styles.mono}>{e.stripe_event_id.slice(0, 24)}…</td>
                  <td className={styles.muted}>
                    {new Date(e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
