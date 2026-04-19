import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CURRENT_MONTH, countFeatureRowsForMonth } from '@/lib/usage-tracking';
import { ensureApplicationsForAnalyses } from '@/lib/ensure-applications-for-analyses';
import { getEffectivePlan, getFeatureAccess, getPlanLimits, type Plan } from '@/lib/plans';
import TailorClient, { type TailorInitialData } from './TailorClient';

export const metadata = {
  title: 'Resume Tailoring Workspace',
  description: 'Review saved applications, generate tailored resume suggestions, and export accepted changes.',
};

export default async function TailorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  await ensureApplicationsForAnalyses(supabase, user.id);

  const [{ data: profile }, { data: activeResume }, { data: applications }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, plan, subscription_status')
      .eq('id', user.id)
      .single(),
    supabase
      .from('resumes')
      .select('id, filename, parse_status, parsed_data')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('applications')
      .select('id, analysis_id, job_title, company, location, created_at')
      .eq('user_id', user.id)
      .not('analysis_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const rawPlan = (profile?.plan || 'free') as Plan;
  const plan = getEffectivePlan(rawPlan, profile?.subscription_status);
  const features = getFeatureAccess(plan);
  const limits = getPlanLimits(plan);
  const usedTailoring = await countFeatureRowsForMonth(supabase, 'tailored_resumes', CURRENT_MONTH());

  const initialData: TailorInitialData = {
    plan,
    userName: profile?.full_name || user.email?.split('@')[0] || 'there',
    features: {
      before_after_score: features.before_after_score,
      docx_download: features.docx_download,
      natural_voice_pass: features.natural_voice_pass,
      ats_format_check: features.ats_format_check,
    },
    usage: {
      used: usedTailoring,
      limit: limits.tailoring_per_month,
    },
    activeResume: activeResume
      ? {
          id: activeResume.id,
          filename: activeResume.filename,
          parse_status: activeResume.parse_status,
          parsed_data: (activeResume.parsed_data as Record<string, unknown> | null) ?? null,
        }
      : null,
    applications: (applications || []).map((application) => ({
      id: application.id,
      analysis_id: application.analysis_id as string,
      job_title: application.job_title,
      company: application.company,
      location: application.location,
      created_at: application.created_at,
    })),
  };

  return (
    <>
      <TailorClient initialData={initialData} />
    </>
  );
}
