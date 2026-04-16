import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Gauge,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  deriveTargetKeywords,
  getResumeEvidenceStatus,
  normalizeAnalysisMetadata,
  normalizeMatchedSkills,
  normalizeRecruiterConcerns,
  normalizeScore,
  normalizeScoreBreakdown,
  normalizeSkillGaps,
} from '@/lib/analysis-report';

function formatDate(value?: string | null) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getVerdictMeta(verdict: string, score: number | null) {
  if (verdict === 'apply') {
    return {
      label: score !== null && score >= 85 ? 'Strong fit' : 'Worth applying',
      badge: 'bg-green-100 text-green-800 border-green-200',
      ring: '#16a34a',
    };
  }

  if (verdict === 'low-priority') {
    return {
      label: 'Selective fit',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      ring: '#d97706',
    };
  }

  return {
    label: 'Weak fit',
    badge: 'bg-red-100 text-red-800 border-red-200',
    ring: '#dc2626',
  };
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="transparent" stroke="#e7e5e4" strokeWidth="8" />
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
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-4xl font-black text-stone-950">{score}%</strong>
        <span className="text-[11px] uppercase tracking-[0.3em] text-stone-500 font-bold">Fit score</span>
      </div>
    </div>
  );
}

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: analysis, error } = await supabase
    .from('job_analyses')
    .select('id, created_at, job_title, company, location, employment_type, job_url, job_description_raw, overall_score, skills_score, experience_score, domain_score, verdict, matched_skills, skill_gaps, recruiter_concerns, seniority_analysis, analysis_metadata')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!analysis) {
    notFound();
  }

  const overallScore = normalizeScore(analysis.overall_score) ?? 0;
  const scoreBreakdown = normalizeScoreBreakdown(analysis as Record<string, unknown>);
  const matchedSkills = normalizeMatchedSkills(analysis.matched_skills);
  const skillGaps = normalizeSkillGaps(analysis.skill_gaps);
  const recruiterConcerns = normalizeRecruiterConcerns(analysis.recruiter_concerns);
  const metadata = normalizeAnalysisMetadata(analysis.analysis_metadata);
  const resumeEvidence = getResumeEvidenceStatus(metadata);
  const targetKeywords = deriveTargetKeywords(matchedSkills, skillGaps);
  const verdictMeta = getVerdictMeta(analysis.verdict || 'skip', overallScore);
  const seniority = analysis.seniority_analysis && typeof analysis.seniority_analysis === 'object'
    ? analysis.seniority_analysis as Record<string, unknown>
    : null;
  const scoringMethod = metadata.scoring_method;

  return (
    <>
      <div className="min-h-screen p-6 lg:p-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </Link>
            <h1 className="text-3xl lg:text-4xl font-black text-stone-950 tracking-tight">{analysis.job_title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-stone-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 border border-stone-200"><BriefcaseBusiness className="w-4 h-4" /> {analysis.company}</span>
              {analysis.location ? <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 border border-stone-200"><MapPin className="w-4 h-4" /> {analysis.location}</span> : null}
              {analysis.employment_type ? <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 border border-stone-200">{analysis.employment_type}</span> : null}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 border border-stone-200">Run {formatDate(analysis.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/analyzer" className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-bold text-white hover:bg-stone-800 transition-colors">
              <Sparkles className="w-4 h-4" /> Analyze another role
            </Link>
            {analysis.job_url ? (
              <a href={analysis.job_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors">
                <ExternalLink className="w-4 h-4" /> Original job post
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
          <section className="xl:col-span-4 rounded-3xl border border-stone-200 bg-white p-7 flex flex-col items-center text-center">
            <ScoreRing score={overallScore} color={verdictMeta.ring} />
            <span className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${verdictMeta.badge}`}>
              {verdictMeta.label}
            </span>
            <p className="mt-3 text-sm text-stone-600 max-w-xs">
              This score reflects the weighted fit between your resume evidence and the pasted job description.
            </p>

            <div className="mt-6 grid w-full gap-3 text-left">
              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">
                <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Skills match</span><strong className="text-stone-950">{scoreBreakdown.skills ?? '--'}%</strong></div>
                <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${scoreBreakdown.skills ?? 0}%` }} /></div>
              </div>
              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">
                <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Experience match</span><strong className="text-stone-950">{scoreBreakdown.experience ?? '--'}%</strong></div>
                <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${scoreBreakdown.experience ?? 0}%` }} /></div>
              </div>
              <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">
                <div className="flex items-center justify-between text-sm"><span className="text-stone-500">Domain match</span><strong className="text-stone-950">{scoreBreakdown.domain ?? '--'}%</strong></div>
                <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden"><div className="h-full rounded-full bg-violet-500" style={{ width: `${scoreBreakdown.domain ?? 0}%` }} /></div>
              </div>
            </div>
          </section>

          <section className="xl:col-span-8 grid gap-6">
            <article className="rounded-3xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-stone-900" />
                <h2 className="text-lg font-black text-stone-950">How WorthApply scored this role</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-stone-500 mb-3">Scoring formula</p>
                  <p className="text-sm text-stone-700 leading-6">
                    The AI compares your resume against the job description across three weighted dimensions:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-stone-700">
                    <li><strong>Skills:</strong> {scoringMethod?.weights?.skills ?? 40}%</li>
                    <li><strong>Experience:</strong> {scoringMethod?.weights?.experience ?? 35}%</li>
                    <li><strong>Domain:</strong> {scoringMethod?.weights?.domain ?? 25}%</li>
                  </ul>
                  <p className="mt-3 text-sm text-stone-600">
                    Overall score = skills × 0.40 + experience × 0.35 + domain × 0.25.
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-stone-500 mb-3">Decision thresholds</p>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li><strong>70% and above:</strong> apply</li>
                    <li><strong>40% to 69%:</strong> low priority / tailor first</li>
                    <li><strong>Below 40%:</strong> skip</li>
                  </ul>
                  <p className="mt-3 text-sm text-stone-600">
                    Recruiter concerns and seniority mismatch do not directly change the weighted formula, but they explain why a role may still be risky.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-4">
                {resumeEvidence.tone === 'positive' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                <h2 className="text-lg font-black text-stone-950">Resume evidence status</h2>
              </div>
              <div className={`rounded-2xl border p-5 ${resumeEvidence.tone === 'positive' ? 'bg-emerald-50 border-emerald-200' : resumeEvidence.tone === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
                <p className="text-sm font-bold text-stone-950">{resumeEvidence.label}</p>
                <p className="mt-2 text-sm text-stone-700 leading-6">{resumeEvidence.detail}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
                  <span className="rounded-full bg-white px-3 py-1 border border-stone-200">Model: {metadata.model || 'unknown'}</span>
                  <span className="rounded-full bg-white px-3 py-1 border border-stone-200">Prompt: {metadata.prompt_version || 'legacy'}</span>
                  <span className="rounded-full bg-white px-3 py-1 border border-stone-200">Resume parse: {metadata.resume_parse_status || 'none'}</span>
                </div>
              </div>
            </article>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 grid gap-6">
            <article className="rounded-3xl border border-stone-200 bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-stone-950">What matched</h2>
                  <p className="text-sm text-stone-500 mt-1">These are the strongest signals the AI found in your resume.</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">{matchedSkills.length} strengths</span>
              </div>
              <div className="divide-y divide-stone-200">
                {matchedSkills.length ? matchedSkills.map((item, index) => (
                  <div key={`${item.skill}-${index}`} className="px-6 py-5 flex gap-4">
                    <div className="mt-0.5 h-10 w-10 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-950">{item.skill}</p>
                      <p className="mt-1 text-sm text-stone-600 leading-6">{item.evidence_from_resume}</p>
                    </div>
                  </div>
                )) : <p className="px-6 py-6 text-sm text-stone-500">No matched skills were stored for this analysis.</p>}
              </div>
            </article>

            <article className="rounded-3xl border border-stone-200 bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-stone-950">What is missing or weak</h2>
                  <p className="text-sm text-stone-500 mt-1">These are the gaps the AI thinks could lower your chances.</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.24em] text-stone-500">{skillGaps.length} gaps</span>
              </div>
              <div className="divide-y divide-stone-200">
                {skillGaps.length ? skillGaps.map((item, index) => (
                  <div key={`${item.skill}-${index}`} className="px-6 py-5 flex gap-4">
                    <div className="mt-0.5 h-10 w-10 shrink-0 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-stone-950">{item.skill}</p>
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600">{item.impact} impact</span>
                      </div>
                      <p className="mt-2 text-sm text-stone-600 leading-6">{item.suggestion}</p>
                    </div>
                  </div>
                )) : <p className="px-6 py-6 text-sm text-stone-500">No material skill gaps were stored for this analysis.</p>}
              </div>
            </article>

            <article className="rounded-3xl border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-black text-stone-950">Recruiter concerns and seniority</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-stone-500 mb-3">Seniority assessment</p>
                  {seniority ? (
                    <>
                      <div className="space-y-2 text-sm text-stone-700">
                        <div className="flex justify-between gap-3"><span className="text-stone-500">Role level</span><strong className="text-stone-950">{typeof seniority.role_level === 'string' ? seniority.role_level : 'Unknown'}</strong></div>
                        <div className="flex justify-between gap-3"><span className="text-stone-500">Your level</span><strong className="text-stone-950">{typeof seniority.user_level === 'string' ? seniority.user_level : 'Unknown'}</strong></div>
                      </div>
                      <p className="mt-3 text-sm text-stone-600 leading-6">{typeof seniority.assessment === 'string' ? seniority.assessment : 'No assessment available.'}</p>
                    </>
                  ) : (
                    <p className="text-sm text-stone-500">No seniority assessment stored for this analysis.</p>
                  )}
                </div>
                <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-stone-500 mb-3">Recruiter concerns</p>
                  {recruiterConcerns.length ? (
                    <div className="space-y-4">
                      {recruiterConcerns.map((item, index) => (
                        <div key={`${item.concern}-${index}`}>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600 border border-stone-200">{item.severity}</span>
                            <strong className="text-sm text-stone-950">{item.concern}</strong>
                          </div>
                          <p className="mt-2 text-sm text-stone-600 leading-6">{item.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500">No recruiter concerns were saved for this analysis.</p>
                  )}
                </div>
              </div>
            </article>
          </section>

          <aside className="xl:col-span-4 grid gap-6">
            <article className="rounded-3xl border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-black text-stone-950">Target keywords</h2>
              <p className="mt-2 text-sm text-stone-500">The report treats these as the core signals to match, prove, or address.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {targetKeywords.length ? targetKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700 border border-stone-200">
                    {keyword}
                  </span>
                )) : <p className="text-sm text-stone-500">No keywords were extracted from this saved report.</p>}
              </div>
            </article>

            <article className="rounded-3xl border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-black text-stone-950">Original job description</h2>
              <p className="mt-2 text-sm text-stone-500">This is the exact job description text the AI scored against.</p>
              <div className="mt-4 rounded-2xl bg-stone-50 border border-stone-200 p-4 max-h-[28rem] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-stone-700">
                {analysis.job_description_raw}
              </div>
            </article>
          </aside>
        </div>
      </div>
    </>
  );
}
