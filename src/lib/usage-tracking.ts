import type { SupabaseClient } from '@supabase/supabase-js';

const CURRENT_MONTH = () => new Date().toISOString().slice(0, 7) + '-01';

type UsageFeature = 'analyses' | 'tailoring' | 'cover_letters' | 'job_scrapes';
type LegacyUsageColumn = 'analyses_count';

interface ReserveMonthlyUsageResult {
  allowed: boolean;
  used: number;
}

function getLegacyUsageColumn(feature: UsageFeature): LegacyUsageColumn | null {
  switch (feature) {
    case 'analyses':
      return 'analyses_count';
    default:
      return null;
  }
}

async function getAuthenticatedUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user.id;
}

async function reserveMonthlyUsageLegacy(
  supabase: SupabaseClient,
  column: LegacyUsageColumn,
  limit: number | null,
  month: string
): Promise<ReserveMonthlyUsageResult> {
  const userId = await getAuthenticatedUserId(supabase);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: existingRow, error: fetchError } = await supabase
      .from('usage_tracking')
      .select(`id, ${column}`)
      .eq('month', month)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    const currentValue = Number(existingRow?.[column] ?? 0);

    if (limit !== null && currentValue >= limit) {
      return {
        allowed: false,
        used: currentValue,
      };
    }

    if (!existingRow) {
      const { data: insertedRow, error: insertError } = await supabase
        .from('usage_tracking')
        .insert({ user_id: userId, month, [column]: 1 })
        .select(`id, ${column}`)
        .single();

      if (!insertError && insertedRow) {
        return {
          allowed: true,
          used: Number(insertedRow[column] ?? 1),
        };
      }

      if (insertError?.code === '23505') {
        continue;
      }

      throw insertError;
    }

    const nextValue = currentValue + 1;
    const { data: updatedRow, error: updateError } = await supabase
      .from('usage_tracking')
      .update({ [column]: nextValue })
      .eq('id', existingRow.id)
      .eq(column, currentValue)
      .select(`id, ${column}`)
      .maybeSingle();

    if (!updateError && updatedRow) {
      return {
        allowed: true,
        used: Number(updatedRow[column] ?? nextValue),
      };
    }

    if (updateError) {
      throw updateError;
    }
  }

  throw new Error(`Failed to reserve legacy usage for ${column} after retries`);
}

async function releaseMonthlyUsageLegacy(
  supabase: SupabaseClient,
  column: LegacyUsageColumn,
  month: string
): Promise<number> {
  const { data: existingRow, error: fetchError } = await supabase
    .from('usage_tracking')
    .select(`id, ${column}`)
    .eq('month', month)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existingRow) {
    return 0;
  }

  const nextValue = Math.max(Number(existingRow[column] ?? 0) - 1, 0);

  const { data: updatedRow, error: updateError } = await supabase
    .from('usage_tracking')
    .update({ [column]: nextValue })
    .eq('id', existingRow.id)
    .select(column)
    .single();

  if (updateError) {
    throw updateError;
  }

  return Number(updatedRow?.[column] ?? nextValue);
}

export async function reserveMonthlyUsage(
  supabase: SupabaseClient,
  feature: UsageFeature,
  limit: number | null,
  month = CURRENT_MONTH()
): Promise<ReserveMonthlyUsageResult> {
  const legacyColumn = getLegacyUsageColumn(feature);

  if (legacyColumn) {
    return reserveMonthlyUsageLegacy(supabase, legacyColumn, limit, month);
  }

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
  const legacyColumn = getLegacyUsageColumn(feature);

  if (legacyColumn) {
    return releaseMonthlyUsageLegacy(supabase, legacyColumn, month);
  }

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
