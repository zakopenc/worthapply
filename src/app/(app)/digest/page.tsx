import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DigestClient from './DigestClient';

export const metadata = {
  title: 'Daily Digest',
  description: 'Review curated job matches ranked by fit, location alignment, and search relevance.',
};

export default async function DigestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const today = new Date().toISOString().split('T')[0];

  const { data: matches } = await supabase
    .from('digest_matches')
    .select('id, job_title, company, location, location_type, salary, overall_score, verdict, matched_keywords, bookmarked')
    .eq('user_id', user.id)
    .gte('created_at', today)
    .order('overall_score', { ascending: false });

  const safeMatches = matches || [];
  const summary = {
    total: safeMatches.length,
    strongFits: safeMatches.filter((match) => match.verdict === 'apply').length,
    remoteFriendly: safeMatches.filter((match) => match.location_type === 'remote').length,
    avgScore: safeMatches.length
      ? Math.round(safeMatches.reduce((sum, match) => sum + (match.overall_score || 0), 0) / safeMatches.length)
      : 0,
  };

  return (
    <>
      <DigestClient
        matches={safeMatches}
        plan={profile?.plan || 'free'}
        summary={summary}
      />
    </>
  );
}
