import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ensureApplicationsForAnalyses } from '@/lib/ensure-applications-for-analyses';
import OutreachClient, { type OutreachWorkspaceOption } from './OutreachClient';

export const metadata = {
  title: 'Outreach Copilot',
  description: 'Generate recruiter messages, referral asks, and follow-up sequences grounded in your real experience.',
};

interface OutreachPageProps {
  searchParams: Promise<{ applicationId?: string }>;
}

export default async function OutreachPage({ searchParams: searchParamsPromise }: OutreachPageProps) {
  const searchParams = await searchParamsPromise;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  await ensureApplicationsForAnalyses(supabase, user.id);

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase.from('profiles').select('plan, subscription_status').eq('id', user.id).single(),
    supabase
      .from('applications')
      .select('id, job_title, company, analysis_id, created_at')
      .eq('user_id', user.id)
      .not('analysis_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const options: OutreachWorkspaceOption[] = (applications || [])
    .filter((a) => Boolean(a.analysis_id))
    .map((a) => ({
      id: a.id,
      jobTitle: a.job_title,
      company: a.company,
      analysisId: a.analysis_id as string,
      createdAt: a.created_at,
    }));

  const selectedId = searchParams?.applicationId;
  const initialOption = options.find((o) => o.id === selectedId) || options[0] || null;

  const plan = profile?.plan || 'free';

  return (
    <OutreachClient
      plan={plan}
      options={options}
      initialApplicationId={initialOption?.id || null}
    />
  );
}
