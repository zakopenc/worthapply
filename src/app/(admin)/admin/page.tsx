import Link from 'next/link';
import { getAdminOverviewData, getRecentAdminAudit } from '@/lib/admin/overview-data';
import styles from './overview.module.css';

function tone(n: number, warnAt: number, dangerAt: number): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (n >= dangerAt) return 'danger';
  if (n >= warnAt) return 'warn';
  if (n > 0) return 'neutral';
  return 'ok';
}

function metricClass(t: 'ok' | 'warn' | 'danger' | 'neutral'): string {
  if (t === 'danger') return styles.metricDanger;
  if (t === 'warn') return styles.metricWarn;
  if (t === 'ok') return styles.metricOk;
  return styles.metricNeutral;
}

export const metadata = {
  title: 'Overview — Admin',
  robots: 'noindex,nofollow' as const,
};

export default async function AdminOverviewPage() {
  const [data, audit] = await Promise.all([getAdminOverviewData(), getRecentAdminAudit(10)]);
  const opsFailed = tone(data.ops.failedResumes7d, 1, 5);
  const opsPending = tone(data.ops.pendingResumes, 3, 10);
  const opsWh = tone(data.ops.webhookFailures24h, 1, 3);
  const opsAi = tone(data.ops.aiErrors24h, 3, 10);
  const trFlag = data.trust.flagged > 0 ? 'warn' : 'ok';
  const trSus = data.trust.suspended > 0 ? 'danger' : 'ok';
  const trPriv = data.trust.pendingPrivacy > 0 ? 'warn' : 'ok';
  const supOpen = tone(data.supportOpen, 1, 8);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>
          Monitor growth, product health, and trust signals. Use the sections below to drill into users, operations,
          and compliance workflows.
        </p>
      </header>

      <div className={styles.divider} />

      <section className={styles.section} aria-labelledby="growth-heading">
        <h2 id="growth-heading" className={styles.sectionLabel}>
          Growth
        </h2>
        <div className={styles.grid4}>
          <div className={`${styles.card} ${styles.cardStatic}`}>
            <span className={`${styles.metric} ${styles.metricNeutral}`}>{data.totalUsers}</span>
            <span className={styles.cardTitle}>Total users</span>
            <span className={styles.cardHint}>Profiles in the database</span>
          </div>
          <div className={`${styles.card} ${styles.cardStatic}`}>
            <span className={`${styles.metric} ${styles.metricNeutral}`}>{data.signups7d}</span>
            <span className={styles.cardTitle}>New signups</span>
            <span className={styles.cardHint}>Last 7 days</span>
          </div>
          <div className={`${styles.card} ${styles.cardStatic}`}>
            <span className={`${styles.metric} ${styles.metricNeutral}`}>{data.paidPlans}</span>
            <span className={styles.cardTitle}>Paid plans</span>
            <span className={styles.cardHint}>Pro or Premium</span>
          </div>
          <Link href="/admin/users" className={styles.card}>
            <span className={`${styles.metric} ${styles.metricNeutral}`}>→</span>
            <span className={styles.cardTitle}>User directory</span>
            <span className={styles.cardHint}>Search, inspect profiles, and take support actions</span>
            <span className={styles.cardCta}>Open users</span>
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="support-heading">
        <h2 id="support-heading" className={styles.sectionLabel}>
          Support inbox
        </h2>
        <div className={styles.grid4}>
          <Link href="/admin/support" className={styles.card}>
            <span className={`${styles.metric} ${metricClass(supOpen)}`}>{data.supportOpen}</span>
            <span className={styles.cardTitle}>Open tickets</span>
            <span className={styles.cardHint}>Reports from the in-app Help &amp; support form</span>
            <span className={styles.cardCta}>View inbox</span>
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="health-heading">
        <h2 id="health-heading" className={styles.sectionLabel}>
          Product health
        </h2>
        <div className={styles.grid4}>
          <Link href="/admin/ops/resumes" className={styles.card}>
            <span className={`${styles.metric} ${metricClass(opsFailed)}`}>{data.ops.failedResumes7d}</span>
            <span className={styles.cardTitle}>Failed resume parses</span>
            <span className={styles.cardHint}>Last 7 days — investigate parsing pipeline</span>
            <span className={styles.cardCta}>View resumes</span>
          </Link>
          <Link href="/admin/ops/resumes?status=pending" className={styles.card}>
            <span className={`${styles.metric} ${metricClass(opsPending)}`}>{data.ops.pendingResumes}</span>
            <span className={styles.cardTitle}>Pending / processing</span>
            <span className={styles.cardHint}>Resumes still in the queue</span>
            <span className={styles.cardCta}>View queue</span>
          </Link>
          <Link href="/admin/ops/webhooks" className={styles.card}>
            <span className={`${styles.metric} ${metricClass(opsWh)}`}>{data.ops.webhookFailures24h}</span>
            <span className={styles.cardTitle}>Webhook failures</span>
            <span className={styles.cardHint}>Last 24 hours — billing &amp; Stripe events</span>
            <span className={styles.cardCta}>View webhooks</span>
          </Link>
          <Link href="/admin/ops/ai-errors" className={styles.card}>
            <span className={`${styles.metric} ${metricClass(opsAi)}`}>{data.ops.aiErrors24h}</span>
            <span className={styles.cardTitle}>AI errors</span>
            <span className={styles.cardHint}>Last 24 hours — Gemini / fallback routes</span>
            <span className={styles.cardCta}>View errors</span>
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="trust-heading">
        <h2 id="trust-heading" className={styles.sectionLabel}>
          Trust &amp; safety
        </h2>
        <div className={styles.grid3}>
          <Link href="/admin/trust/flags" className={styles.card}>
            <span className={`${styles.metric} ${trFlag === 'warn' ? styles.metricWarn : styles.metricOk}`}>
              {data.trust.flagged}
            </span>
            <span className={styles.cardTitle}>Flagged accounts</span>
            <span className={styles.cardHint}>Marked for manual review</span>
            <span className={styles.cardCta}>Review flags</span>
          </Link>
          <Link href="/admin/trust/flags?status=suspended" className={styles.card}>
            <span className={`${styles.metric} ${trSus === 'danger' ? styles.metricDanger : styles.metricOk}`}>
              {data.trust.suspended}
            </span>
            <span className={styles.cardTitle}>Suspended</span>
            <span className={styles.cardHint}>Blocked from the application</span>
            <span className={styles.cardCta}>View suspended</span>
          </Link>
          <Link href="/admin/trust/privacy" className={styles.card}>
            <span className={`${styles.metric} ${trPriv === 'warn' ? styles.metricWarn : styles.metricOk}`}>
              {data.trust.pendingPrivacy}
            </span>
            <span className={styles.cardTitle}>Privacy requests</span>
            <span className={styles.cardHint}>Awaiting admin action</span>
            <span className={styles.cardCta}>Process queue</span>
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="audit-heading">
        <h2 id="audit-heading" className={styles.sectionLabel}>
          Recent admin activity
        </h2>
        {audit.length === 0 ? (
          <div className={styles.auditEmpty}>No audit log entries yet.</div>
        ) : (
          <div className={styles.auditCard}>
            <table className={styles.auditTable}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {audit.map(row => (
                  <tr key={row.id}>
                    <td className={styles.auditTime}>
                      {new Date(row.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className={styles.auditAction}>{row.action}</td>
                    <td className={styles.auditMeta}>
                      {row.target_user_id ? (
                        <Link href={`/admin/users/${row.target_user_id}`} className={styles.auditLink}>
                          User profile
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={styles.auditMeta}>{row.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="quick-heading">
        <h2 id="quick-heading" className={styles.sectionLabel}>
          Shortcuts
        </h2>
        <div className={styles.quickRow}>
          <Link href="/admin/users" className={`${styles.quickBtn} ${styles.quickBtnPrimary}`}>
            User management
          </Link>
          <Link href="/admin/support" className={styles.quickBtn}>
            Support inbox
          </Link>
          <Link href="/admin/ops" className={styles.quickBtn}>
            Ops center
          </Link>
          <Link href="/admin/trust" className={styles.quickBtn}>
            Trust overview
          </Link>
          <Link href="/admin/trust/abuse" className={styles.quickBtn}>
            Usage &amp; abuse review
          </Link>
        </div>
      </section>
    </div>
  );
}
