import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Ensures each job analysis has a corresponding applications row with analysis_id set.
 * The analyzer only persisted job_analyses until this linking existed; tailor/cover-letter
 * depend on applications.analysis_id.
 */
export async function ensureApplicationsForAnalyses(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data: analyses, error: analysesError } = await supabase
    .from('job_analyses')
    .select('id, job_title, company, location, job_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (analysesError || !analyses?.length) {
    if (analysesError) {
      console.error('[ensureApplicationsForAnalyses] job_analyses:', analysesError);
    }
    return;
  }

  const { data: linkedRows, error: linkedError } = await supabase
    .from('applications')
    .select('analysis_id')
    .eq('user_id', userId)
    .not('analysis_id', 'is', null);

  if (linkedError) {
    console.error('[ensureApplicationsForAnalyses] applications:', linkedError);
    return;
  }

  const linked = new Set((linkedRows || []).map((r) => r.analysis_id));
  const orphans = analyses.filter((a) => !linked.has(a.id));

  if (!orphans.length) return;

  const { error: insertError } = await supabase.from('applications').insert(
    orphans.map((ja) => ({
      user_id: userId,
      analysis_id: ja.id,
      job_title: ja.job_title,
      company: ja.company,
      location: ja.location,
      status: 'wishlist',
      source: ja.job_url || null,
    }))
  );

  if (insertError) {
    console.error('[ensureApplicationsForAnalyses] insert:', insertError);
  }
}
