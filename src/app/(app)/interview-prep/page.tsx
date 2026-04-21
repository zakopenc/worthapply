import { redirect } from 'next/navigation';
import { isPremiumPlan, type Plan } from '@/lib/plans';
import { createClient } from '@/lib/supabase/server';
import { ensureApplicationsForAnalyses } from '@/lib/ensure-applications-for-analyses';
import InterviewPrepClient, {
  type InterviewPrepOption,
  type InterviewPrepAnalysis,
  type InterviewPrepRecord,
} from './InterviewPrepClient';

export const metadata = {
  title: 'Interview Prep Studio',
  description: 'Company-specific question bank, STAR story matcher, and interviewer briefing tied to your saved jobs.',
};

interface InterviewPrepPageProps {
  searchParams: Promise<{ applicationId?: string }>;
}

export default async function InterviewPrepPage({ searchParams: searchParamsPromise }: InterviewPrepPageProps) {
  const searchParams = await searchParamsPromise;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await ensureApplicationsForAnalyses(supabase, user.id);

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase.from('profiles').select('plan, subscription_status').eq('id', user.id).single(),
    supabase
      .from('applications')
      .select('id, job_title, company, analysis_id, created_at, status')
      .eq('user_id', user.id)
      .not('analysis_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const options: InterviewPrepOption[] = (applications || [])
    .filter((a) => Boolean(a.analysis_id))
    .map((a) => ({
      id: a.id,
      jobTitle: a.job_title,
      company: a.company,
      analysisId: a.analysis_id as string,
      createdAt: a.created_at,
      status: a.status,
    }));

  const selectedOption = options.find((o) => o.id === searchParams?.applicationId) || options[0] || null;

  let analysis: InterviewPrepAnalysis | null = null;
  let prep: InterviewPrepRecord | null = null;

  if (selectedOption) {
    const [{ data: analysisRow }, { data: prepRow }] = await Promise.all([
      supabase
        .from('job_analyses')
        .select('id, job_title, company, overall_score, verdict, seniority_analysis, recruiter_concerns')
        .eq('id', selectedOption.analysisId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('interview_preps')
        .select('id, application_id, analysis_id, interview_stage, interviewer_notes, content, metadata, version, created_at')
        .eq('application_id', selectedOption.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
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
          seniority: (analysisRow.seniority_analysis as { level?: string } | null)?.level || null,
          concerns: (analysisRow.recruiter_concerns as { concern: string; severity: string }[] | null) || [],
        }
      : null;

    prep = prepRow
      ? {
          id: prepRow.id,
          applicationId: prepRow.application_id,
          analysisId: prepRow.analysis_id,
          stage: prepRow.interview_stage,
          interviewerNotes: prepRow.interviewer_notes,
          content: prepRow.content,
          metadata: prepRow.metadata,
          version: prepRow.version,
          createdAt: prepRow.created_at,
        }
      : null;
  }

  const plan = (profile?.plan || 'free') as Plan;
  const isPremium = isPremiumPlan(plan);

  return (
    <InterviewPrepClient
      plan={plan}
      isPremium={isPremium}
      options={options}
      analysis={analysis}
      initialPrep={prep}
    />
  );
}
