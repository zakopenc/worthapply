import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { stripeCustomerDashboardUrl } from '@/lib/admin/stripe-dashboard-url';
import { RepairPlanForm, ResetUsageForm, AccountStatusForm, DeleteUserForm } from './AdminActions';
import styles from './page.module.css';

type UsageRow = { resource_type: string; used: number; period: string };

async function getUserDetail(userId: string) {
  const supabase = await createServiceClient();

  const [
    { data: authUser },
    { data: profile },
    { data: usage },
    { count: resumeCount },
    { count: analysisCount },
    { data: auditLog },
  ] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase.from('profiles')
      .select('full_name, plan, subscription_status, onboarding_complete, created_at, stripe_customer_id, account_status')
      .eq('id', userId)
      .single(),
    supabase.from('monthly_usage')
      .select('resource_type, used, period')
      .eq('user_id', userId)
      .order('period', { ascending: false })
      .limit(12),
    supabase.from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase.from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase.from('admin_audit_log')
      .select('id, admin_id, action, diff, reason, created_at')
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (!authUser?.user || !profile) return null;

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const thisMonthUsage = (usage ?? []).filter((r: UsageRow) => r.period === currentMonth);

  return {
    id: userId,
    email: authUser.user.email ?? '',
    full_name: profile.full_name,
    plan: profile.plan,
    subscription_status: profile.subscription_status,
    onboarding_complete: profile.onboarding_complete,
    created_at: profile.created_at,
    stripe_customer_id: profile.stripe_customer_id,
    account_status: profile.account_status ?? 'active',
    usage: thisMonthUsage as UsageRow[],
    resume_count: resumeCount ?? 0,
    analysis_count: analysisCount ?? 0,
    audit_log: auditLog ?? [],
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

const RESOURCE_LABELS: Record<string, string> = {
  analyses: 'Analyses',
  tailoring: 'Tailoring',
  cover_letters: 'Cover Letters',
  job_scrapes: 'LinkedIn Searches',
};

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserDetail(id);

  if (!user) notFound();

  return (
    <div>
      <div className={styles.backRow}>
        <Link href="/admin/users" className={styles.backLink}>← Back to users</Link>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{user.full_name || 'Unnamed User'}</h1>
          <p className={styles.email}>{user.email}</p>
        </div>
        <div className={styles.headerMeta}>
          <span className={`${styles.badge} ${user.plan === 'free' ? styles.badgeFree : user.plan === 'pro' ? styles.badgePro : styles.badgePremium}`}>
            {user.plan}
          </span>
          {user.subscription_status && (
            <span className={`${styles.badge} ${user.subscription_status === 'active' || user.subscription_status === 'trialing' ? styles.badgeActive : styles.badgePastDue}`}>
              {user.subscription_status}
            </span>
          )}
          {user.account_status !== 'active' && (
            <span className={`${styles.badge} ${user.account_status === 'suspended' ? styles.badgePastDue : styles.badgeNeutral}`}>
              {user.account_status}
            </span>
          )}
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.statsGrid}>
          <StatCard label="Resumes" value={user.resume_count} />
          <StatCard label="Analyses" value={user.analysis_count} />
          <StatCard label="Onboarded" value={user.onboarding_complete ? 'Yes' : 'No'} />
          <StatCard label="Joined" value={new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
          <StatCard label="User ID" value={user.id.slice(0, 8) + '…'} />
        </div>
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
        <h2 className={styles.sectionTitle}>Usage This Month</h2>
        {user.usage.length === 0 ? (
          <p className={styles.empty}>No usage recorded this month.</p>
        ) : (
          <div className={styles.usageGrid}>
            {user.usage.map((u: UsageRow) => (
              <div key={u.resource_type} className={styles.usageCard}>
                <span className={styles.usageCount}>{u.used}</span>
                <span className={styles.usageLabel}>{RESOURCE_LABELS[u.resource_type] ?? u.resource_type}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Admin Actions</h2>
        <div className={styles.actionsGrid}>
          <RepairPlanForm
            userId={user.id}
            currentPlan={user.plan}
            currentStatus={user.subscription_status}
          />
          <ResetUsageForm userId={user.id} />
          <AccountStatusForm userId={user.id} currentStatus={user.account_status} />
          <DeleteUserForm userId={user.id} userEmail={user.email} />
        </div>
      </section>

      {user.audit_log.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Audit Log</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Reason</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {user.audit_log.map((entry: { id: string; action: string; reason: string | null; created_at: string }) => (
                  <tr key={entry.id}>
                    <td className={styles.actionCell}>{entry.action}</td>
                    <td className={styles.muted}>{entry.reason || '—'}</td>
                    <td className={styles.muted}>
                      {new Date(entry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
