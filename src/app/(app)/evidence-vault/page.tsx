import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEffectivePlan, isPremiumPlan, type Plan } from '@/lib/plans';
import EvidenceVaultClient, { type EvidenceItem } from './EvidenceVaultClient';

export const metadata = {
  title: 'Evidence Vault',
  description: 'Your reusable bank of achievements, projects, and stories — built once, used across every application.',
};

export default async function EvidenceVaultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status')
    .eq('id', user.id)
    .single();

  const plan = getEffectivePlan(profile?.plan as Plan, profile?.subscription_status);
  const isPremium = isPremiumPlan(plan);

  let items: EvidenceItem[] = [];
  if (isPremium) {
    const { data } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    items = (data || []) as EvidenceItem[];
  }

  const { data: resume } = await supabase
    .from('resumes')
    .select('id, parse_status')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasResume = Boolean(resume?.id && resume.parse_status === 'complete');

  return (
    <EvidenceVaultClient
      plan={plan}
      isPremium={isPremium}
      initialItems={items}
      hasResume={hasResume}
    />
  );
}
