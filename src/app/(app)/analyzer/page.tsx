'use client';

import { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

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
  domain_experience?: {
    overlap?: string[];
  };
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

export default function AnalyzerPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setResults(null);
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jobDescription, job_url: jobUrl || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();
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
          status: 'saved',
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
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">
          WorthApply / Job Fit Analyzer
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
              Job Fit Analyzer
            </h1>
            <p className="text-on-surface-variant mt-1">
              Paste a job description to see how well your background matches.
            </p>
          </div>
          {results && (
            <div className="flex gap-3">
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
                href="/tailor"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold hover:bg-[#1c1c1a]/90 active:scale-95 transition-all shadow-lg"
              >
                <Zap className="w-4 h-4" /> Tailor Resume
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Results — if available show above form */}
      {results && verdict && (
        <div className="mb-8 grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Score Hero */}
          <div className={`xl:col-span-4 rounded-2xl p-8 border ${verdict.bg} ${verdict.border} flex flex-col items-center text-center`}>
            <ScoreRing score={results.overall_score} color={verdict.ringColor} />
            <div className="mt-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${verdict.badge} mb-3`}>
                {verdict.label}
              </span>
              <p className="text-sm text-on-surface-variant">{verdict.sublabel}</p>
            </div>

            {/* Seniority */}
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
          </div>

          {/* Evidence Match */}
          <div className="xl:col-span-8 flex flex-col gap-5">

            {/* Matched Skills */}
            {results.matched_skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-on-surface">
                    Matched Strengths
                  </h3>
                  <span className="ml-auto text-xs text-on-surface-variant">
                    {results.matched_skills.length} found
                  </span>
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

            {/* Skill Gaps */}
            {results.skill_gaps?.length > 0 && (
              <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-on-surface">Areas to Address</h3>
                  <span className="ml-auto text-xs text-on-surface-variant">
                    {results.skill_gaps.length} gaps
                  </span>
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
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            {gap.suggestion}
                          </p>
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

            {/* Domain Experience */}
            {(results.domain_experience?.overlap?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-outline-variant/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">
                  Domain Overlap
                </p>
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

            {/* Tailor CTA */}
            <div className="bg-[#1c1c1a] rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold mb-1">Ready to tailor your application?</p>
                <p className="text-white/50 text-sm">
                  Customize your resume to target this specific role.
                </p>
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

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center">
            <FileText className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div>
            <h2 className="font-bold text-on-surface">
              {results ? 'Analyze Another Job' : 'Enter Job Details'}
            </h2>
            <p className="text-xs text-on-surface-variant">
              Fill in the job information below
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
              <LinkIcon className="w-3 h-3" /> Job URL{' '}
              <span className="text-on-surface-variant/50 normal-case font-medium">(optional)</span>
            </label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://example.com/jobs/12345"
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
              rows={10}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 transition-all resize-y min-h-[200px]"
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
