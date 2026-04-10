import type { SupabaseClient } from '@supabase/supabase-js';

const CURRENT_MONTH = () => new Date().toISOString().slice(0, 7) + '-01';

type UsageFeature = 'analyses' | 'tailoring' | 'cover_letters' | 'job_scrapes';

interface ReserveMonthlyUsageResult {
  allowed: boolean;
  used: number;
}

export async function reserveMonthlyUsage(
  supabase: SupabaseClient,
  feature: UsageFeature,
  limit: number | null,
  month = CURRENT_MONTH()
): Promise<ReserveMonthlyUsageResult> {
  const { data, error } = await supabase.rpc('reserve_monthly_usage', {
    p_feature: feature,
    p_limit: limit,
    p_month: month,
  });

  if (error) {
    throw error;
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error(`No usage reservation result returned for ${feature}`);
  }

  return {
    allowed: Boolean(result.allowed),
    used: Number(result.used ?? 0),
  };
}

export async function releaseMonthlyUsage(
  supabase: SupabaseClient,
  feature: UsageFeature,
  month = CURRENT_MONTH()
): Promise<number> {
  const { data, error } = await supabase.rpc('release_monthly_usage', {
    p_feature: feature,
    p_month: month,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

export { CURRENT_MONTH };
