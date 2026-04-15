import { createServiceClient } from '@/lib/supabase/server';
import styles from './trust.module.css';

async function getTrustSummary() {
  const supabase = await createServiceClient();

  const [
    { count: flaggedCount },
    { count: suspendedCount },
    { count: pendingPrivacy },
    { data: topUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'flagged'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'suspended'),
    supabase.from('privacy_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('monthly_usage')
      .select('user_id, used')
      .eq('period', new Date().toISOString().slice(0, 7) + '-01')
      .order('used', { ascending: false })
      .limit(5),
  ]);

  return {
    flagged: flaggedCount ?? 0,
    suspended: suspendedCount ?? 0,
    pendingPrivacy: pendingPrivacy ?? 0,
    topUsers: topUsers ?? [],
  };
}

export default async function TrustPage() {
  const summary = await getTrustSummary();

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: 24 }}>Trust & Risk</h1>

      <div className={styles.cardsGrid}>
        <a href="/admin/trust/flags" className={styles.card}>
          <span className={`${styles.cardCount} ${summary.flagged > 0 ? styles.warn : styles.ok}`}>
            {summary.flagged}
          </span>
          <span className={styles.cardLabel}>Flagged Accounts</span>
          <span className={styles.cardSub}>Marked for review</span>
        </a>

        <a href="/admin/trust/flags?status=suspended" className={styles.card}>
          <span className={`${styles.cardCount} ${summary.suspended > 0 ? styles.danger : styles.ok}`}>
            {summary.suspended}
          </span>
          <span className={styles.cardLabel}>Suspended Accounts</span>
          <span className={styles.cardSub}>Blocked from app</span>
        </a>

        <a href="/admin/trust/privacy" className={styles.card}>
          <span className={`${styles.cardCount} ${summary.pendingPrivacy > 0 ? styles.warn : styles.ok}`}>
            {summary.pendingPrivacy}
          </span>
          <span className={styles.cardLabel}>Privacy Requests</span>
          <span className={styles.cardSub}>Pending action</span>
        </a>

        <a href="/admin/trust/abuse" className={styles.card}>
          <span className={styles.cardCount} style={{ color: '#1a1a2e' }}>
            {summary.topUsers.reduce((s, u) => s + (u.used ?? 0), 0)}
          </span>
          <span className={styles.cardLabel}>Top-5 User Usage</span>
          <span className={styles.cardSub}>This month, all resources</span>
        </a>
      </div>
    </div>
  );
}
