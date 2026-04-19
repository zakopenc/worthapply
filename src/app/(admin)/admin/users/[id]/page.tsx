import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { stripeCustomerDashboardUrl } from '@/lib/admin/stripe-dashboard-url';
import { CopyUserId } from './CopyUserId';
import {
  RepairPlanForm,
  ResetUsageForm,
  AccountStatusForm,
  DeleteUserForm,
} from './AdminActions';
import styles from './page.module.css';

type UsageRow = { resource_type: string; used: number; period: string };

const RESOURCE_ORDER = ['analyses', 'tailoring', 'cover_letters', 'job_scrapes'] as const;

const RESOURCE_LABELS: Record<string, string> = {
  analyses: 'Analyses',
  tailoring: 'Tailoring',
  cover_letters: 'Cover letters',
  job_scrapes: 'LinkedIn searches',
};

function usageHistoryRows(rows: UsageRow[], monthCount = 3) {
  const byPeriod = new Map<string, Partial<Record<string, number>>>();
  for (const r of rows) {
    if (!byPeriod.has(r.period)) byPeriod.set(r.period, {});
    const slot = byPeriod.get(r.period)!;
    slot[r.resource_type] = r.used;
  }
  const periods = [...byPeriod.keys()].sort((a, b) => b.localeCompare(a)).slice(0, monthCount);
  return periods.map(period => {
    const slot = byPeriod.get(period) ?? {};
    return {
      period,
      label: new Date(period.includes('T') ? period : `${period}T12:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      values: RESOURCE_ORDER.map(k => ({ key: k, used: slot[k] ?? 0 })),
    };
  });
}

function formatAuditDiff(diff: unknown): string {
  if (diff == null || diff === undefined) return '—';
  try {
    const s = JSON.stringify(diff);
    return s.length > 160 ? `${s.slice(0, 160)}…` : s;
  } catch {
    return '—';
  }
}

async function getUserDetail(userId: string) {
  const supabase = await createServiceClient();

  const [
    { data: authUser },
    { data: profile },
    { data: usageRows },
    { count: resumeCount },
    { count: analysisCount },
    { data: auditLog },
  ] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from('profiles')
      .select('full_name, plan, subscription_status, onboarding_complete, created_at, stripe_customer_id, account_status')
      .eq('id', userId)
      .single(),
    supabase.from('monthly_usage').select('resource_type, used, period').eq('user_id', userId).order('period', { ascending: false }).limit(48),
    supabase.from('resumes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('admin_audit_log')
      .select('id, admin_id, action, diff, reason, created_at')
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(25),
  ]);

  if (!authUser?.user || !profile) return null;

  const u = authUser.user;
  const usage = (usageRows ?? []) as UsageRow[];

  return {
    id: userId,
    email: u.email ?? '',
    full_name: profile.full_name,
    plan: profile.plan,
    subscription_status: profile.subscription_status,
    onboarding_complete: profile.onboarding_complete,
    created_at: profile.created_at,
    stripe_customer_id: profile.stripe_customer_id,
    account_status: profile.account_status ?? 'active',
    usage_history: usage,
    resume_count: resumeCount ?? 0,
    analysis_count: analysisCount ?? 0,
    audit_log: auditLog ?? [],
    auth_created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    email_verified: !!u.email_confirmed_at,
  };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserDetail(id);

  if (!user) notFound();

  const usageTable = usageHistoryRows(user.usage_history, 3);

  return (
    <div className={styles.pageRoot}>
      <div className={styles.backRow}>
        <Link href="/admin/users" className={styles.backLink}>
          ← Back to users
        </Link>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{user.full_name || 'Unnamed User'}</h1>
          <p className={styles.email}>{user.email}</p>
        </div>
        <div className={styles.headerMeta}>
          <span
            className={`${styles.badge} ${user.plan === 'free' ? styles.badgeFree : user.plan === 'pro' ? styles.badgePro : styles.badgePremium}`}
          >
            {user.plan}
          </span>
          {user.subscription_status && (
            <span
              className={`${styles.badge} ${user.subscription_status === 'active' || user.subscription_status === 'trialing' ? styles.badgeActive : styles.badgePastDue}`}
            >
              {user.subscription_status}
            </span>
          )}
          {user.account_status !== 'active' && (
            <span
              className={`${styles.badge} ${user.account_status === 'suspended' ? styles.badgePastDue : styles.badgeNeutral}`}
            >
              {user.account_status}
            </span>
          )}
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <p className={styles.sectionHint}>Product usage counts and profile dates.</p>
        <div className={styles.statsGrid}>
          <StatCard label="Resumes" value={user.resume_count} />
          <StatCard label="Analyses" value={user.analysis_count} />
          <StatCard label="Onboarded" value={user.onboarding_complete ? 'Yes' : 'No'} />
          <StatCard
            label="Joined (app)"
            value={new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User ID</h2>
        <p className={styles.sectionHint}>Use full UUID in support tickets and Supabase.</p>
        <CopyUserId userId={user.id} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Auth activity</h2>
        <p className={styles.sectionHint}>From Supabase Auth (sign-in and verification).</p>
        <div className={styles.authGrid}>
          <div className={styles.authCard}>
            <span className={styles.authLabel}>Email verified</span>
            <span className={styles.authValue}>{user.email_verified ? 'Yes' : 'No'}</span>
          </div>
          <div className={styles.authCard}>
            <span className={styles.authLabel}>Last sign-in</span>
            <span className={styles.authValue}>
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </span>
          </div>
          <div className={styles.authCard}>
            <span className={styles.authLabel}>Auth account created</span>
            <span className={styles.authValue}>
              {user.auth_created_at
                ? new Date(user.auth_created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Billing (Stripe)</h2>
        {user.stripe_customer_id ? (
          <div className={styles.stripeRow}>
            <div className={styles.stripeInfo}>
              <span className={styles.stripeLabel}>Stripe customer</span>
              <code className={styles.stripeId}>{user.stripe_customer_id}</code>
            </div>
            <a
              href={stripeCustomerDashboardUrl(user.stripe_customer_id)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.stripeCta}
            >
              Open in Stripe ↗
            </a>
          </div>
        ) : (
          <p className={styles.stripeMissing}>No Stripe customer ID on file.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage (recent months)</h2>
        <p className={styles.sectionHint}>Monthly counters from billing usage. Up to three most recent periods with data.</p>
        {usageTable.length === 0 ? (
          <p className={styles.empty}>No monthly usage rows yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  {RESOURCE_ORDER.map(k => (
                    <th key={k}>{RESOURCE_LABELS[k] ?? k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usageTable.map(row => (
                  <tr key={row.period}>
                    <td className={styles.actionCell}>{row.label}</td>
                    {row.values.map(({ key, used }) => (
                      <td key={key} className={styles.muted}>
                        {used}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Admin actions</h2>
        <p className={styles.sectionHint}>Changes are audited. A short reason is required for every action.</p>
        <div className={styles.actionsGrid}>
          <div>
            <p className={styles.currentSnapshot}>
              On file: <strong>{user.plan}</strong>
              {user.subscription_status != null && (
                <>
                  {' '}
                  · Subscription <strong>{user.subscription_status}</strong>
                </>
              )}
            </p>
            <RepairPlanForm userId={user.id} currentPlan={user.plan} currentStatus={user.subscription_status} />
          </div>
          <ResetUsageForm userId={user.id} />
        </div>
        <div className={styles.accountRow}>
          <AccountStatusForm userId={user.id} currentStatus={user.account_status} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="danger-heading">
        <h2 id="danger-heading" className={styles.dangerTitle}>
          Danger zone
        </h2>
        <p className={styles.dangerHint}>Permanent deletion cannot be undone. Requires typing the user&apos;s email to confirm.</p>
        <div className={styles.dangerZone}>
          <DeleteUserForm userId={user.id} userEmail={user.email} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Audit log</h2>
        <p className={styles.sectionHint}>Actions targeting this user from the admin audit log.</p>
        {user.audit_log.length === 0 ? (
          <p className={styles.empty}>No admin actions logged for this user yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Admin</th>
                  <th>Reason</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {user.audit_log.map(
                  (entry: {
                    id: string;
                    admin_id: string;
                    action: string;
                    reason: string | null;
                    created_at: string;
                    diff: Record<string, unknown> | null;
                  }) => (
                    <tr key={entry.id}>
                      <td className={styles.muted}>
                        {new Date(entry.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className={styles.actionCell}>{entry.action}</td>
                      <td className={styles.muted}>
                        <Link href={`/admin/users/${entry.admin_id}`} className={styles.adminLink}>
                          {entry.admin_id.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className={styles.muted}>{entry.reason || '—'}</td>
                      <td className={styles.diffCell}>
                        <span className={styles.diffText}>{formatAuditDiff(entry.diff)}</span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
