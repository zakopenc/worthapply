import { createServiceClient } from '@/lib/supabase/server';
import styles from '../ops.module.css';

type AiError = {
  id: string;
  user_id: string | null;
  route: string;
  error_type: string | null;
  error_message: string | null;
  created_at: string;
};

type RouteSummary = {
  route: string;
  count: number;
};

async function getAiErrors(route?: string) {
  const supabase = await createServiceClient();

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [errorsRes, allRecentRes] = await Promise.all([
    (() => {
      let q = supabase
        .from('ai_errors')
        .select('id, user_id, route, error_type, error_message, created_at')
        .gte('created_at', since7d)
        .order('created_at', { ascending: false })
        .limit(100);
      if (route && route !== 'all') q = q.eq('route', route);
      return q;
    })(),
    supabase
      .from('ai_errors')
      .select('route')
      .gte('created_at', since7d),
  ]);

  const errors = (errorsRes.data ?? []) as AiError[];
  const all = allRecentRes.data ?? [];

  // Build per-route summary
  const routeCounts: Record<string, number> = {};
  for (const row of all) {
    routeCounts[row.route] = (routeCounts[row.route] ?? 0) + 1;
  }
  const summary: RouteSummary[] = Object.entries(routeCounts)
    .map(([r, count]) => ({ route: r, count }))
    .sort((a, b) => b.count - a.count);

  return { errors, summary };
}

export default async function AiErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ route?: string }>;
}) {
  const { route = 'all' } = await searchParams;
  const { errors, summary } = await getAiErrors(route);

  return (
    <div>
      <div className={styles.backRow}>
        <a href="/admin/ops" className={styles.backLink}>← Ops Overview</a>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>AI Errors</h1>
        <span style={{ fontSize: 13, color: '#888' }}>Last 7 days</span>
      </div>

      {summary.length > 0 && (
        <div className={styles.cardsGrid} style={{ marginBottom: 28 }}>
          {summary.map(s => (
            <a key={s.route} href={`/admin/ops/ai-errors?route=${encodeURIComponent(s.route)}`} className={styles.card}>
              <span className={`${styles.cardCount} ${s.count >= 10 ? styles.danger : s.count >= 3 ? styles.warn : styles.ok}`}>
                {s.count}
              </span>
              <span className={styles.cardLabel}>{s.route}</span>
            </a>
          ))}
        </div>
      )}

      <div className={styles.tabs}>
        <a href="/admin/ops/ai-errors" className={`${styles.tab} ${route === 'all' ? styles.tabActive : ''}`}>All</a>
        {summary.map(s => (
          <a
            key={s.route}
            href={`/admin/ops/ai-errors?route=${encodeURIComponent(s.route)}`}
            className={`${styles.tab} ${route === s.route ? styles.tabActive : ''}`}
          >
            {s.route.replace('/api/', '')}
          </a>
        ))}
      </div>

      {errors.length === 0 ? (
        <div className={styles.empty}>No AI errors in the last 7 days.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Route</th>
                <th>Error Type</th>
                <th>Message</th>
                <th>User</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {errors.map(e => (
                <tr key={e.id}>
                  <td className={styles.mono}>{e.route}</td>
                  <td className={styles.muted}>{e.error_type || '—'}</td>
                  <td style={{ maxWidth: 300 }}>
                    <span className={styles.truncate} style={{ display: 'block', fontSize: 13 }}>
                      {e.error_message || '—'}
                    </span>
                  </td>
                  <td className={styles.muted}>
                    {e.user_id ? (
                      <a href={`/admin/users/${e.user_id}`} style={{ color: '#555', textDecoration: 'none', fontSize: 13 }}>
                        {e.user_id.slice(0, 8)}…
                      </a>
                    ) : '—'}
                  </td>
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
