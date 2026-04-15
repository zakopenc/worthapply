import { createServiceClient } from '@/lib/supabase/server';
import styles from './ops.module.css';

async function getOpsSummary() {
  const supabase = await createServiceClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: failedResumes },
    { count: webhookFailures },
    { count: aiErrors24h },
    { count: pendingResumes },
  ] = await Promise.all([
    supabase.from('resumes').select('*', { count: 'exact', head: true }).eq('parse_status', 'failed').gte('created_at', since7d),
    supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since24h),
    supabase.from('ai_errors').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
    supabase.from('resumes').select('*', { count: 'exact', head: true }).in('parse_status', ['pending', 'processing']),
  ]);

  return {
    failedResumes: failedResumes ?? 0,
    webhookFailures: webhookFailures ?? 0,
    aiErrors24h: aiErrors24h ?? 0,
    pendingResumes: pendingResumes ?? 0,
  };
}

function countClass(n: number, warnAt: number, dangerAt: number) {
  if (n >= dangerAt) return styles.danger;
  if (n >= warnAt)   return styles.warn;
  return styles.ok;
}

export default async function OpsPage() {
  const summary = await getOpsSummary();

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: 24 }}>Ops Overview</h1>

      <div className={styles.cardsGrid}>
        <a href="/admin/ops/resumes" className={styles.card}>
          <span className={`${styles.cardCount} ${countClass(summary.failedResumes, 1, 5)}`}>
            {summary.failedResumes}
          </span>
          <span className={styles.cardLabel}>Failed Resumes</span>
          <span className={styles.cardSub}>Last 7 days</span>
        </a>

        <a href="/admin/ops/resumes?status=pending" className={styles.card}>
          <span className={`${styles.cardCount} ${countClass(summary.pendingResumes, 3, 10)}`}>
            {summary.pendingResumes}
          </span>
          <span className={styles.cardLabel}>Stuck / Pending Resumes</span>
          <span className={styles.cardSub}>Currently pending or processing</span>
        </a>

        <a href="/admin/ops/webhooks" className={styles.card}>
          <span className={`${styles.cardCount} ${countClass(summary.webhookFailures, 1, 3)}`}>
            {summary.webhookFailures}
          </span>
          <span className={styles.cardLabel}>Webhook Failures</span>
          <span className={styles.cardSub}>Last 24 hours</span>
        </a>

        <a href="/admin/ops/ai-errors" className={styles.card}>
          <span className={`${styles.cardCount} ${countClass(summary.aiErrors24h, 3, 10)}`}>
            {summary.aiErrors24h}
          </span>
          <span className={styles.cardLabel}>AI Errors</span>
          <span className={styles.cardSub}>Last 24 hours</span>
        </a>
      </div>
    </div>
  );
}
