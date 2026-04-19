import { createServiceClient } from '@/lib/supabase/server';

export type AdminOverviewData = {
  totalUsers: number;
  signups7d: number;
  paidPlans: number;
  ops: {
    failedResumes7d: number;
    pendingResumes: number;
    webhookFailures24h: number;
    aiErrors24h: number;
  };
  trust: {
    flagged: number;
    suspended: number;
    pendingPrivacy: number;
  };
};

/**
 * Single round-trip friendly aggregates for the admin overview dashboard.
 */
export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const supabase = await createServiceClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: signups7d },
    { count: paidPlans },
    { count: failedResumes7d },
    { count: pendingResumes },
    { count: webhookFailures24h },
    { count: aiErrors24h },
    { count: flagged },
    { count: suspended },
    { count: pendingPrivacy },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', since7d),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('plan', ['pro', 'premium', 'lifetime']),
    supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('parse_status', 'failed')
      .gte('created_at', since7d),
    supabase.from('resumes').select('*', { count: 'exact', head: true }).in('parse_status', ['pending', 'processing']),
    supabase
      .from('webhook_events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', since24h),
    supabase.from('ai_errors').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'flagged'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'suspended'),
    supabase.from('privacy_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    signups7d: signups7d ?? 0,
    paidPlans: paidPlans ?? 0,
    ops: {
      failedResumes7d: failedResumes7d ?? 0,
      pendingResumes: pendingResumes ?? 0,
      webhookFailures24h: webhookFailures24h ?? 0,
      aiErrors24h: aiErrors24h ?? 0,
    },
    trust: {
      flagged: flagged ?? 0,
      suspended: suspended ?? 0,
      pendingPrivacy: pendingPrivacy ?? 0,
    },
  };
}

export type AdminAuditRow = {
  id: string;
  admin_id: string;
  target_user_id: string | null;
  action: string;
  reason: string | null;
  created_at: string;
};

/**
 * Latest admin audit entries for the overview strip (global log).
 */
export async function getRecentAdminAudit(limit = 10): Promise<AdminAuditRow[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('id, admin_id, target_user_id, action, reason, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getRecentAdminAudit]', error.message);
    return [];
  }

  return (data ?? []) as AdminAuditRow[];
}
