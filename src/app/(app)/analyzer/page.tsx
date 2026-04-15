'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Target,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Save,
  Building2,
  Briefcase,
  Link as LinkIcon,
  FileText,
  Loader2,
  BrainCircuit,
  Search,
  Sparkles,
  MapPin,
  Clock3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AnalysisResult {
  id: string;
  overall_score: number;
  verdict: 'apply' | 'low-priority' | 'skip';
  matched_skills: Array<{ skill: string; evidence_from_resume: string }>;
  skill_gaps: Array<{ skill: string; impact: string; suggestion: string }>;
  seniority_analysis: {
    role_level: string;
    user_level: string;
    assessment: string;
  };
  analysis_metadata?: {
    used_resume_evidence?: boolean;
    resume_parse_status?: string | null;
    resume_note?: string | null;
    scoring_method?: {
      weights?: {
        skills?: number;
        experience?: number;
        domain?: number;
      };
    };
  };
  domain_experience?: {
    overlap?: string[];
  };
  job_title?: string;
  company?: string;
  job_metadata?: {
    title?: string;
    company?: string;
  };
}

interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url: string;
  postedDate: string;
  experienceLevel?: string;
  jobType?: string;
  applicantsCount?: string;
  benefits?: string[];
  companyLinkedinUrl?: string;
  companyLogo?: string;
  applyUrl?: string;
}

interface SearchUsage {
  used: number;
  limit: number;
  resultsPerSearch: number;
}

const verdictConfig = {
  apply: {
    label: 'Strong Match',
    sublabel: 'Apply immediately',
    scoreColor: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    ringColor: '#22c55e',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  'low-priority': {
    label: 'Partial Match',
    sublabel: 'Worth tailoring before you apply',
    scoreColor: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ringColor: '#f59e0b',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  skip: {
    label: 'Poor Fit',
    sublabel: 'Role may not suit your profile',
    scoreColor: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ringColor: '#ef4444',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="transparent" stroke="#e5e2de" strokeWidth="8" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-on-surface">{score}%</span>
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Match</span>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AnalyzerPage() {
  const searchParams = useSearchParams();

  const [sourceMode, setSourceMode] = useState<'manual' | 'linkedin'>('manual');
  const [plan, setPlan] = useState('free');

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<LinkedInJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<LinkedInJob | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [usage, setUsage] = useState<SearchUsage | null>(null);

  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (profile?.plan) {
        setPlan(profile.plan);
      }
    }

    loadPlan();
  }, []);

  useEffect(() => {
    const title = searchParams.get('title') || '';
    const companyParam = searchParams.get('company') || '';
    const description = searchParams.get('description') || '';
    const url = searchParams.get('url') || '';
    const location = searchParams.get('location') || '';

    if (title) setJobTitle(title);
    if (companyParam) setCompany(companyParam);
    if (description) setJobDescription(description);
    if (url) setJobUrl(url);

    if (title) setSearchTitle(title);
    if (location) setSearchLocation(location);

    if (description) {
      setSourceMode('manual');
    }
  }, [searchParams]);

  const isPaidPlan = plan === 'pro' || plan === 'premium' || plan === 'lifetime';
  const isPremiumPlan = plan === 'premium' || plan === 'lifetime';
  const planResultsCount = isPremiumPlan ? 30 : isPaidPlan ? 10 : 0;

  async function runAnalysis(payload: { title: string; company: string; description: string; url?: string }) {
    setError('');
    setSaved(false);
    setResults(null);
    setLoading(true);
    setShowAllMatches(false);
    setShowAllGaps(false);

    try {
      setJobTitle(payload.title);
      setCompany(payload.company);
      setJobDescription(payload.description);
      setJobUrl(payload.url || '');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: payload.description,
          job_url: payload.url || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data.data.analysis);
      setJobTitle((current) => current || data.data.analysis.job_title || data.data.analysis.job_metadata?.title || '');
      setCompany((current) => current || data.data.analysis.company || data.data.analysis.job_metadata?.company || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError((err as Error).message || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    await runAnalysis({
      title: jobTitle,
      company,
      description: jobDescription,
      url: jobUrl || undefined,
    });
  }

  async function handleAnalyzeSelectedJob() {
    if (!selectedJob) return;

    await runAnalysis({
      title: selectedJob.title,
      company: selectedJob.company,
      description: selectedJob.description,
      url: selectedJob.url || selectedJob.applyUrl || undefined,
    });
  }

  async function handleLinkedInSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError('');
    setSearchResults([]);
    setSelectedJob(null);
    setSearchLoading(true);

    try {
      const response = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: searchTitle || undefined,
          location: searchLocation || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'LinkedIn search failed');
      }

      setUsage(data.usage || null);
      setSearchResults(data.jobs || []);
      if (data.jobs?.length) {
        setSelectedJob(data.jobs[0]);
        setJobTitle(data.jobs[0].title || '');
        setCompany(data.jobs[0].company || '');
        setJobDescription(data.jobs[0].description || '');
        setJobUrl(data.jobs[0].url || data.jobs[0].applyUrl || '');
      }
    } catch (err) {
      setSearchError((err as Error).message || 'Failed to search LinkedIn jobs.');
    } finally {
      setSearchLoading(false);
    }
  }

  function handleSelectJob(job: LinkedInJob) {
    setSelectedJob(job);
    setJobTitle(job.title);
    setCompany(job.company);
    setJobDescription(job.description);
    setJobUrl(job.url || job.applyUrl || '');
    setSaved(false);
  }

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle,
          company,
          status: 'wishlist',
          source: jobUrl || undefined,
          analysis_id: results.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
    } catch (err) {
      setError((err as Error).message || 'Failed to save application');
    } finally {
      setSaving(false);
    }
  }

  const verdict = results ? verdictConfig[results.verdict] : null;
  const visibleMatches = showAllMatches ? results?.matched_skills : results?.matched_skills?.slice(0, 3);
  const visibleGaps = showAllGaps ? results?.skill_gaps : results?.skill_gaps?.slice(0, 3);

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">
          WorthApply / Job Fit Analyzer
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
              Job Fit Analyzer
            </h1>
            <p className="text-on-surface-variant mt-1 max-w-3xl">
              Analyze a role in two ways: paste job details manually, or search fresh LinkedIn jobs and inspect salary, hiring signals, and full role details before running resume fit analysis.
            </p>
          </div>
          {results && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                  saved
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-white text-on-surface border-outline-variant/30 hover:bg-surface-container-low'
                }`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save to Applications'}
              </button>
              <Link
                href={`/analyses/${results.id}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-on-surface rounded-xl text-sm font-bold border border-outline-variant/30 hover:bg-surface-container-low active:scale-95 transition-all"
              >
                <FileText className="w-4 h-4" /> Full Report
              </Link>
              <Link
                href="/tailor"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold hover:bg-[#1c1c1a]/90 active:scale-95 transition-all shadow-lg"
              >
                <Zap className="w-4 h-4" /> Tailor Resume
              </Link>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      {results && verdict && (
        <div className="mb-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className={`xl:col-span-4 rounded-2xl p-8 border ${verdict.bg} ${verdict.border} flex flex-col items-center text-center`}>
            <ScoreRing score={results.overall_score} color={verdict.ringColor} />
            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${verdict.badge} mb-3`}>
                {verdict.label}
              </span>
              <p className="text-sm text-on-surface-variant">{verdict.sublabel}</p>
            </div>

            {results.seniority_analysis && (
              <div className="mt-6 w-full p-4 bg-white/60 rounded-xl border border-outline-variant/20 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Seniority Match</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Role:</span>
                  <span className="font-bold text-on-surface">{results.seniority_analysis.role_level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">You:</span>
                  <span className="font-bold text-on-surface">{results.seniority_analysis.user_level}</span>
                </div>
              </div>
            )}

            <div className="mt-4 w-full p-4 bg-white/70 rounded-xl border border-outline-variant/20 text-left">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-4 h-4 text-secondary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">How the score works</p>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">
                WorthApply compares your resume against the chosen job description across skills, experience, and domain relevance. The weighted formula is 40% skills, 35% experience, and 25% domain.
              </p>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                {results.analysis_metadata?.resume_note || 'This run used the active parsed resume when available. If resume parsing was still pending, the score is less reliable until the resume finishes processing.'}
              </p>
            </div>
          </div>

          <div className="xl:col-span-8 flex flex-col gap-5">
            {results.matched_skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-on-surface">Matched Strengths</h3>
                  <span className="ml-auto text-xs text-on-surface-variant">{results.matched_skills.length} found</span>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {visibleMatches?.map((skill, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm">{skill.skill}</p>
                        {skill.evidence_from_resume && (
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed italic">
                            &ldquo;{skill.evidence_from_resume}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {results.matched_skills.length > 3 && (
                  <button
                    onClick={() => setShowAllMatches(!showAllMatches)}
                    className="w-full px-6 py-3 text-xs font-bold text-secondary uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-surface-container-low transition-colors border-t border-outline-variant/10"
                  >
                    {showAllMatches ? (
                      <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
                    ) : (
                      <><ChevronDown className="w-3.5 h-3.5" /> Show {results.matched_skills.length - 3} More</>
                    )}
                  </button>
                )}
              </div>
            )}

            {results.skill_gaps?.length > 0 && (
              <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-on-surface">Areas to Address</h3>
                  <span className="ml-auto text-xs text-on-surface-variant">{results.skill_gaps.length} gaps</span>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {visibleGaps?.map((gap, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm">{gap.skill}</p>
                        {gap.suggestion && (
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{gap.suggestion}</p>
                        )}
                      </div>
                      {gap.impact && (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
                          gap.impact === 'high' ? 'bg-red-50 text-red-700' :
                          gap.impact === 'medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {gap.impact}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {results.skill_gaps.length > 3 && (
                  <button
                    onClick={() => setShowAllGaps(!showAllGaps)}
                    className="w-full px-6 py-3 text-xs font-bold text-secondary uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-surface-container-low transition-colors border-t border-outline-variant/10"
                  >
                    {showAllGaps ? (
                      <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
                    ) : (
                      <><ChevronDown className="w-3.5 h-3.5" /> Show {results.skill_gaps.length - 3} More</>
                    )}
                  </button>
                )}
              </div>
            )}

            {(results.domain_experience?.overlap?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">Domain Overlap</p>
                <div className="flex flex-wrap gap-2">
                  {results.domain_experience?.overlap?.map((domain, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-surface-container rounded-full text-xs font-bold text-on-surface border border-outline-variant/20"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#1c1c1a] rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold mb-1">Ready to tailor your application?</p>
                <p className="text-white/50 text-sm">Customize your resume to target this specific role.</p>
              </div>
              <Link
                href="/tailor"
                className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-black uppercase tracking-wider whitespace-nowrap hover:opacity-90 active:scale-95 transition-all shrink-0"
              >
                Tailor Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSourceMode('manual')}
          className={`rounded-2xl border p-5 text-left transition-all ${
            sourceMode === 'manual'
              ? 'border-stone-900 bg-stone-900 text-white shadow-lg'
              : 'border-outline-variant/20 bg-white hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sourceMode === 'manual' ? 'bg-white/10' : 'bg-surface-container'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black tracking-tight">Manual job entry</p>
              <p className={`text-sm ${sourceMode === 'manual' ? 'text-white/70' : 'text-on-surface-variant'}`}>
                Paste a job description and analyze immediately.
              </p>
            </div>
          </div>
          <p className={`text-sm leading-relaxed ${sourceMode === 'manual' ? 'text-white/75' : 'text-on-surface-variant'}`}>
            Best when you already have a job posting open, copied from LinkedIn, Greenhouse, Lever, or any company career page.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSourceMode('linkedin')}
          className={`rounded-2xl border p-5 text-left transition-all ${
            sourceMode === 'linkedin'
              ? 'border-stone-900 bg-stone-900 text-white shadow-lg'
              : 'border-outline-variant/20 bg-white hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sourceMode === 'linkedin' ? 'bg-white/10' : 'bg-surface-container'}`}>
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black tracking-tight">Search LinkedIn jobs</p>
              <p className={`text-sm ${sourceMode === 'linkedin' ? 'text-white/70' : 'text-on-surface-variant'}`}>
                Type a job title, inspect fresh results, then analyze the exact role.
              </p>
            </div>
          </div>
          <p className={`text-sm leading-relaxed ${sourceMode === 'linkedin' ? 'text-white/75' : 'text-on-surface-variant'}`}>
            Pro users get the latest 10 LinkedIn jobs per search. Premium users get the latest 30. Salary is shown whenever LinkedIn exposes it.
          </p>
        </button>
      </div>

      {sourceMode === 'linkedin' && (
        <div className="mb-8 space-y-6">
          <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center">
                <Search className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div>
                <h2 className="font-bold text-on-surface">LinkedIn search</h2>
                <p className="text-xs text-on-surface-variant">
                  Search recent LinkedIn jobs by title, inspect salary and role details, then analyze against your active resume.
                </p>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              {!isPaidPlan ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-amber-900">LinkedIn search is a paid feature</h3>
                      <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                        Upgrade to Pro to unlock fresh LinkedIn job discovery inside the analyzer. Pro returns up to 10 jobs per search. Premium returns up to 30.
                      </p>
                      <Link
                        href="/pricing"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-stone-800 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" /> Upgrade to unlock search
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 font-semibold text-stone-700">
                      {isPremiumPlan ? 'Premium / Lifetime' : 'Pro'} plan
                    </span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1.5 font-semibold text-secondary">
                      {planResultsCount} jobs per search
                    </span>
                    {usage && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                        {usage.used}/{usage.limit} searches used this month
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleLinkedInSearch} className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr_auto] gap-4 items-end">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2">
                        Job title
                      </label>
                      <input
                        type="text"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        placeholder="e.g. IT Support Engineer, Product Designer, Customer Success Manager"
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="Remote, United States, Montreal, Dubai..."
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="h-[50px] inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 text-sm font-bold text-white hover:bg-stone-800 transition-colors disabled:opacity-60"
                    >
                      {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      {searchLoading ? 'Searching…' : 'Search LinkedIn'}
                    </button>
                  </form>

                  {searchError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {searchError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-5 bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-on-surface">Fresh LinkedIn jobs</h3>
                    <p className="text-xs text-on-surface-variant">
                      Pick a role to inspect the full details before analyzing fit.
                    </p>
                  </div>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                    {searchResults.length} results
                  </span>
                </div>

                <div className="max-h-[46rem] overflow-y-auto divide-y divide-outline-variant/10">
                  {searchResults.map((job) => (
                    <button
                      type="button"
                      key={job.id}
                      onClick={() => handleSelectJob(job)}
                      className={`w-full text-left px-6 py-5 transition-colors ${selectedJob?.id === job.id ? 'bg-stone-950 text-white' : 'hover:bg-surface-container-lowest'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm leading-snug">{job.title}</p>
                          <p className={`text-sm mt-1 ${selectedJob?.id === job.id ? 'text-white/70' : 'text-on-surface-variant'}`}>
                            {job.company}
                          </p>
                        </div>
                        {job.salary && (
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${selectedJob?.id === job.id ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                            {job.salary}
                          </span>
                        )}
                      </div>
                      <div className={`mt-3 flex flex-wrap gap-3 text-xs ${selectedJob?.id === job.id ? 'text-white/70' : 'text-on-surface-variant'}`}>
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                        <span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> {formatDate(job.postedDate)}</span>
                        {job.jobType && <span className="inline-flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.jobType}</span>}
                      </div>
                      <p className={`mt-3 text-xs leading-relaxed line-clamp-3 ${selectedJob?.id === job.id ? 'text-white/75' : 'text-on-surface-variant'}`}>
                        {job.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="xl:col-span-7 bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
                {selectedJob ? (
                  <>
                    <div className="px-6 py-5 border-b border-outline-variant/10">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">Selected LinkedIn job</p>
                          <h3 className="text-2xl font-extrabold tracking-tight text-on-surface">{selectedJob.title}</h3>
                          <p className="text-on-surface-variant mt-1">{selectedJob.company}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.url && (
                            <a
                              href={selectedJob.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" /> View on LinkedIn
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={handleAnalyzeSelectedJob}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-stone-800 transition-colors disabled:opacity-60"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                            Analyze this job
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-xl bg-surface-container-low px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Location</p>
                          <p className="font-semibold text-on-surface">{selectedJob.location || 'Not listed'}</p>
                        </div>
                        <div className="rounded-xl bg-surface-container-low px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Salary</p>
                          <p className="font-semibold text-on-surface">{selectedJob.salary || 'Not listed'}</p>
                        </div>
                        <div className="rounded-xl bg-surface-container-low px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Posted</p>
                          <p className="font-semibold text-on-surface">{formatDate(selectedJob.postedDate)}</p>
                        </div>
                        <div className="rounded-xl bg-surface-container-low px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Employment type</p>
                          <p className="font-semibold text-on-surface">{selectedJob.jobType || 'Not listed'}</p>
                        </div>
                        <div className="rounded-xl bg-surface-container-low px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Experience level</p>
                          <p className="font-semibold text-on-surface">{selectedJob.experienceLevel || 'Not listed'}</p>
                        </div>
                        <div className="rounded-xl bg-surface-container-low px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Applicants</p>
                          <p className="font-semibold text-on-surface">{selectedJob.applicantsCount || 'Not listed'}</p>
                        </div>
                      </div>

                      {selectedJob.benefits?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedJob.benefits.map((benefit) => (
                            <span
                              key={benefit}
                              className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-black uppercase tracking-widest text-secondary mb-3">Full role details</p>
                      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-5 max-h-[30rem] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-on-surface">
                        {selectedJob.description}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center">
                    <Search className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-on-surface mb-2">Select a job to inspect</h3>
                    <p className="text-on-surface-variant max-w-md mx-auto">
                      Search LinkedIn above, then click a result to open a clean detail screen with salary, hiring signals, and the full role description.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center">
            <FileText className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div>
            <h2 className="font-bold text-on-surface">
              {sourceMode === 'linkedin' ? 'Selected job analysis payload' : results ? 'Analyze Another Job' : 'Manual job entry'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {sourceMode === 'linkedin'
                ? 'Review or edit the chosen job before running analysis.'
                : 'Paste the full role details below.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                required
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Google, Startup"
                required
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition-all"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3" /> Job URL <span className="text-on-surface-variant/50 normal-case font-medium">(optional)</span>
            </label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-black uppercase tracking-widest text-secondary mb-2 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here — requirements, responsibilities, qualifications..."
              required
              rows={12}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition-all resize-y min-h-[220px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#1c1c1a] text-white rounded-xl font-bold text-base hover:bg-[#1c1c1a]/90 active:scale-[0.99] transition-all disabled:opacity-60 shadow-lg"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing your fit...</>
            ) : (
              <><Target className="w-5 h-5" /> Analyze Job Fit</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
