import { redirect } from 'next/navigation';
import { isPaidPlan } from '@/lib/plans';
import { createClient } from '@/lib/supabase/server';
import CoverLetterClient, { type CoverLetterRecord, type CoverLetterWorkspaceAnalysis, type CoverLetterWorkspaceOption } from './CoverLetterClient';

export const metadata = {
  title: 'Cover Letter Builder',
  description: 'Generate a role-aware cover letter recommendation or full draft from your existing WorthApply job analysis.',
};

interface CoverLetterPageProps {
  searchParams: Promise<{
    applicationId?: string;
  }>;
}

export default async function CoverLetterPage({ searchParams: searchParamsPromise }: CoverLetterPageProps) {
  const searchParams = await searchParamsPromise;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', user.id).single(),
    supabase
      .from('applications')
      .select('id, job_title, company, analysis_id, created_at')
      .eq('user_id', user.id)
      .not('analysis_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const workspaceOptions: CoverLetterWorkspaceOption[] = (applications || [])
    .filter((application) => Boolean(application.analysis_id))
    .map((application) => ({
      id: application.id,
      jobTitle: application.job_title,
      company: application.company,
      analysisId: application.analysis_id as string,
      createdAt: application.created_at,
    }));

  const selectedOption = workspaceOptions.find((option) => option.id === searchParams?.applicationId) || workspaceOptions[0] || null;

  let analysis: CoverLetterWorkspaceAnalysis | null = null;
  let coverLetter: CoverLetterRecord | null = null;

  if (selectedOption) {
    const [{ data: analysisRow }, { data: coverLetterRow }] = await Promise.all([
      supabase
        .from('job_analyses')
        .select('id, job_title, company, overall_score, verdict')
        .eq('id', selectedOption.analysisId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('cover_letters')
        .select('id, recommendation, content, version, created_at')
        .eq('application_id', selectedOption.id)
        .eq('user_id', user.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    analysis = analysisRow
      ? {
          id: analysisRow.id,
          applicationId: selectedOption.id,
          jobTitle: analysisRow.job_title,
          company: analysisRow.company,
          overallScore: analysisRow.overall_score,
          verdict: analysisRow.verdict,
        }
      : null;

    coverLetter = coverLetterRow
      ? {
          id: coverLetterRow.id,
          recommendation: coverLetterRow.recommendation,
          content: coverLetterRow.content,
          version: coverLetterRow.version,
          createdAt: coverLetterRow.created_at,
        }
      : null;
  }

  const plan = profile?.plan || 'free';
  const gatedCoverLetter = coverLetter
    ? {
        ...coverLetter,
        content: isPaidPlan(plan) ? coverLetter.content : null,
      }
    : null;

  return (
    <>
      <CoverLetterClient
        plan={plan}
        options={workspaceOptions}
        analysis={analysis}
        initialCoverLetter={gatedCoverLetter}
      />
    </>
  );
}
