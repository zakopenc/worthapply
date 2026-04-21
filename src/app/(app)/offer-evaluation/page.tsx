import { redirect } from 'next/navigation';
import { isPremiumPlan, type Plan } from '@/lib/plans';
import { createClient } from '@/lib/supabase/server';
import { ensureApplicationsForAnalyses } from '@/lib/ensure-applications-for-analyses';
import OfferEvaluationClient, {
  type OfferEvaluationOption,
  type OfferEvaluationRecord,
} from './OfferEvaluationClient';

export const metadata = {
  title: 'Offer Evaluation & Salary Negotiation',
  description: 'Parse your offer, project 4-year total comp with scenarios, identify negotiation levers, and generate the exact scripts to ask for more.',
};

interface OfferEvaluationPageProps {
  searchParams: Promise<{ applicationId?: string }>;
}

export default async function OfferEvaluationPage({ searchParams: searchParamsPromise }: OfferEvaluationPageProps) {
  const searchParams = await searchParamsPromise;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await ensureApplicationsForAnalyses(supabase, user.id);

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase.from('profiles').select('plan, subscription_status').eq('id', user.id).single(),
    supabase
      .from('applications')
      .select('id, job_title, company, location, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(80),
  ]);

  const options: OfferEvaluationOption[] = (applications || []).map((a) => ({
    id: a.id,
    jobTitle: a.job_title,
    company: a.company,
    location: a.location,
    status: a.status,
  }));

  const selectedOption = options.find((o) => o.id === searchParams?.applicationId) || null;

  let evaluation: OfferEvaluationRecord | null = null;
  if (selectedOption) {
    const { data: evalRow } = await supabase
      .from('offer_evaluations')
      .select('id, application_id, offer_text, parsed_offer, projection, negotiation, metadata, version, created_at')
      .eq('application_id', selectedOption.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (evalRow) {
      evaluation = {
        id: evalRow.id,
        applicationId: evalRow.application_id,
        offerText: evalRow.offer_text,
        parsedOffer: evalRow.parsed_offer,
        projection: evalRow.projection,
        negotiation: evalRow.negotiation,
        metadata: evalRow.metadata,
        version: evalRow.version,
        createdAt: evalRow.created_at,
      };
    }
  }

  const plan = (profile?.plan || 'free') as Plan;
  const isPremium = isPremiumPlan(plan);

  return (
    <OfferEvaluationClient
      plan={plan}
      isPremium={isPremium}
      options={options}
      selectedApplicationId={selectedOption?.id || null}
      initialEvaluation={evaluation}
    />
  );
}
