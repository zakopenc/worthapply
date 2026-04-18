'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

interface DigestMatch {
  id: string;
  job_title: string;
  company: string;
  location: string;
  location_type: 'remote' | 'hybrid' | 'onsite';
  salary: string | null;
  overall_score: number;
  verdict: 'apply' | 'low-priority' | 'skip';
  matched_keywords: string[];
  bookmarked: boolean;
}

interface DigestClientProps {
  matches: DigestMatch[];
  plan: string;
  summary: {
    total: number;
    strongFits: number;
    remoteFriendly: number;
    avgScore: number;
  };
}

const LOCATION_TYPES = ['all', 'remote', 'hybrid', 'onsite'] as const;

function getScoreColor(score: number) {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function getVerdictConfig(verdict: DigestMatch['verdict']) {
  if (verdict === 'apply') return { label: 'Strong fit', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  if (verdict === 'low-priority') return { label: 'Selective fit', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
  return { label: 'Low fit', cls: 'bg-red-50 text-red-700 border border-red-200' };
}

function labelLocationType(type: DigestMatch['location_type']) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function DigestClient({ matches, plan, summary }: DigestClientProps) {
  const [filter, setFilter] = useState<string>('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(matches.filter((m) => m.bookmarked).map((m) => m.id))
  );

  const isFree = plan === 'free';

  const filtered = useMemo(
    () => (filter === 'all' ? matches : matches.filter((m) => m.location_type === filter)),
    [filter, matches]
  );

  const toggleBookmark = async (id: string) => {
    const next = new Set(bookmarks);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setBookmarks(next);
    await fetch(`/api/digest/${id}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: next.has(id) }),
    });
  };

  const header = (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
            Daily Digest
          </h1>
          <p className="text-on-surface-variant mt-1 max-w-2xl">
            Today&apos;s strongest matches, ranked by fit. Bookmark what&apos;s worth revisiting, then move high-signal roles into the analyzer.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold hover:bg-[#1c1c1a]/90 active:scale-95 transition-all shadow-lg whitespace-nowrap"
          >
            <Search className="w-4 h-4" /> Analyze a role
          </Link>
          <Link
            href="/tracker"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-on-surface rounded-xl text-sm font-bold border border-outline-variant/30 hover:bg-surface-container-low active:scale-95 transition-all whitespace-nowrap"
          >
            <BriefcaseBusiness className="w-4 h-4" /> Open tracker
          </Link>
        </div>
      </div>
    </header>
  );

  const metrics = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Today's matches", value: summary.total, icon: Target, desc: 'Fresh roles curated from your targeting profile.' },
        { label: 'Strong fits', value: summary.strongFits, icon: Sparkles, desc: 'Opportunities worth prioritizing first.' },
        { label: 'Remote friendly', value: summary.remoteFriendly, icon: MapPin, desc: 'Roles aligned with remote-first preferences.' },
        { label: 'Avg fit score', value: summary.avgScore ? `${summary.avgScore}%` : '--', icon: TrendingUp, desc: 'A quick read on today\'s overall digest quality.' },
      ].map(({ label, value, icon: Icon, desc }) => (
        <div key={label} className="bg-white rounded-2xl border border-outline-variant/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
            <Icon className="w-4 h-4 text-on-surface-variant/50" />
          </div>
          <p className="text-3xl font-black tracking-tight text-on-surface">{value}</p>
          <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );

  const filterBar = (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-5 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Filter by work style</p>
          <p className="font-bold text-on-surface">Refine the list</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant">
          <Filter className="w-3.5 h-3.5" /> {filtered.length} visible
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {LOCATION_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
              filter === type
                ? 'bg-stone-950 text-white border-stone-950'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-stone-300'
            }`}
          >
            {type === 'all' ? 'All matches' : labelLocationType(type)}
          </button>
        ))}
      </div>
    </div>
  );

  const cards = filtered.length === 0 ? (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-16 text-center">
      <Sparkles className="w-12 h-12 text-on-surface-variant/25 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-on-surface mb-2">No matches in this filter</h3>
      <p className="text-on-surface-variant max-w-sm mx-auto">
        Try another work-style view or check back tomorrow after WorthApply refreshes your digest.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map((match) => {
        const isBookmarked = bookmarks.has(match.id);
        const verdict = getVerdictConfig(match.verdict);
        return (
          <article key={match.id} className="bg-white rounded-2xl border border-outline-variant/20 p-6 relative hover:-translate-y-0.5 transition-transform">
            <button
              onClick={() => toggleBookmark(match.id)}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-surface-container-low text-on-surface-variant/50 border border-transparent hover:border-outline-variant/20'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <div className="flex items-start gap-3 pr-10 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 text-lg font-black text-on-surface-variant border border-outline-variant/20">
                {match.company.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-on-surface leading-snug truncate">{match.job_title}</p>
                <p className="text-sm text-on-surface-variant mt-0.5 truncate">{match.company}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant border border-outline-variant/10">
                <MapPin className="w-3 h-3" /> {match.location}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant border border-outline-variant/10">
                {labelLocationType(match.location_type)}
              </span>
              {match.salary ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  {match.salary}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-2xl font-black tracking-tight ${getScoreColor(match.overall_score)}`}>
                  {match.overall_score}%
                </p>
                <p className="text-xs text-on-surface-variant font-medium">Fit score</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${verdict.cls}`}>
                {verdict.label}
              </span>
            </div>

            {match.matched_keywords?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {match.matched_keywords.slice(0, 5).map((kw, i) => (
                  <span key={`${match.id}-${i}`} className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-bold text-on-surface-variant border border-outline-variant/10">
                    {kw}
                  </span>
                ))}
              </div>
            ) : null}

            <Link
              href={`/analyzer?digest=${match.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm font-bold border border-outline-variant/20 hover:bg-stone-950 hover:text-white hover:border-stone-950 transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Analyze this role
            </Link>
          </article>
        );
      })}
    </div>
  );

  if (isFree) {
    return (
      <div className="min-h-screen p-6 lg:p-10">
        {header}
        <div className="relative">
          <div className="blur-sm pointer-events-none opacity-40 select-none">
            {metrics}
            {filterBar}
            {cards}
          </div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4">
            <div className="bg-white rounded-3xl border border-outline-variant/20 shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-on-surface-variant" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-on-surface mb-2">Unlock Daily Digest</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
                Upgrade to Pro to see curated matches every day, bookmark the best opportunities, and focus your energy on roles most worth pursuing.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {['Daily ranked matches', 'Bookmark & review flow', 'Faster shortlisting'].map((b) => (
                  <span key={b} className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant border border-outline-variant/10">
                    {b}
                  </span>
                ))}
              </div>
              <Link
                href="/settings?tab=billing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold hover:bg-[#1c1c1a]/90 transition-all w-full justify-center"
              >
                Upgrade to Pro <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {header}
      {metrics}
      {filterBar}
      {cards}
    </div>
  );
}
