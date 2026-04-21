'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Save, Sparkles, Target, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export interface InterviewPrepOption {
  id: string;
  jobTitle: string;
  company: string;
  analysisId: string;
  createdAt: string;
  status: string | null;
}

export interface InterviewPrepAnalysis {
  id: string;
  applicationId: string;
  jobTitle: string;
  company: string;
  overallScore: number | null;
  verdict: string | null;
  seniority: string | null;
  concerns: { concern: string; severity: string }[];
}

export interface InterviewPrepRecord {
  id: string;
  applicationId: string;
  analysisId: string;
  stage: string;
  interviewerNotes: string | null;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
}

interface PrepQuestion {
  question: string;
  category: string;
  competency: string;
  why_asked: string;
  difficulty: string;
  prep_hint: string;
}

interface PrepStarStory {
  title: string;
  competencies: string[];
  source_bullet: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  adaptability: string;
}

interface PrepContent {
  summary?: string;
  stage_context?: { duration_estimate_minutes?: number; format?: string; signal_hunted?: string };
  questions?: PrepQuestion[];
  star_stories?: PrepStarStory[];
  questions_to_ask?: { question: string; type: string; what_it_signals: string }[];
  company_research?: { topic: string; source: string; how_to_use: string }[];
  red_flags_to_avoid?: { concern: string; avoid: string; replace_with: string }[];
  thirty_sixty_ninety_plan?: { applicable: boolean; days_30?: string[]; days_60?: string[]; days_90?: string[] };
  narrative_gaps?: { area: string; risk: string; mitigation: string }[];
  checklist?: string[];
  confidence_coaching?: { framing_statement?: string; body_language_notes?: string; recovery_script?: string };
}

const STAGE_OPTIONS = [
  { value: 'phone_screen', label: 'Phone / Recruiter Screen' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'technical', label: 'Technical / Case' },
  { value: 'onsite_loop', label: 'Onsite Loop' },
  { value: 'executive', label: 'Executive' },
  { value: 'culture_fit', label: 'Culture Fit' },
  { value: 'take_home', label: 'Take-home' },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  behavioral: { label: 'Behavioral', color: '#4338ca' },
  role: { label: 'Role-specific', color: '#0f766e' },
  technical: { label: 'Technical', color: '#7c2d12' },
  company: { label: 'Company', color: '#1d4ed8' },
  scenario: { label: 'Scenario', color: '#9a3412' },
  stretch: { label: 'Stretch / red-flag', color: '#991b1b' },
};

interface InterviewPrepClientProps {
  plan: string;
  isPremium: boolean;
  options: InterviewPrepOption[];
  analysis: InterviewPrepAnalysis | null;
  initialPrep: InterviewPrepRecord | null;
}

export default function InterviewPrepClient({ plan, isPremium, options, analysis, initialPrep }: InterviewPrepClientProps) {
  const router = useRouter();
  const [prep, setPrep] = useState<InterviewPrepRecord | null>(initialPrep);
  const [stage, setStage] = useState<string>(initialPrep?.stage || 'behavioral');
  const [interviewerNotes, setInterviewerNotes] = useState<string>(initialPrep?.interviewerNotes || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'questions' | 'stories' | 'ask' | 'research' | 'flags' | 'plan'>('questions');

  const selectedOption = useMemo(
    () => options.find((o) => o.id === analysis?.applicationId) || null,
    [analysis?.applicationId, options]
  );

  useEffect(() => {
    setPrep(initialPrep);
    setStage(initialPrep?.stage || 'behavioral');
    setInterviewerNotes(initialPrep?.interviewerNotes || '');
    setBanner('');
    setError('');
  }, [initialPrep, analysis?.applicationId]);

  const handleGenerate = async () => {
    if (!analysis) {
      setError('Select a tracked role before generating interview prep.');
      return;
    }
    setLoading(true);
    setError('');
    setBanner('');
    const response = await fetch('/api/interview-prep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: analysis.applicationId,
        analysis_id: analysis.id,
        stage,
        interviewer_notes: interviewerNotes.trim() || undefined,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || 'Unable to generate interview prep right now.');
      setLoading(false);
      return;
    }
    const next = payload.data as InterviewPrepRecord;
    setPrep(next);
    setBanner(`Interview prep ready for the ${STAGE_OPTIONS.find((s) => s.value === next.stage)?.label || next.stage} stage.`);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!prep) return;
    setSaving(true);
    setError('');
    setBanner('');
    const response = await fetch('/api/interview-prep', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prep_id: prep.id,
        content: prep.content,
        interviewer_notes: interviewerNotes.trim() || undefined,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || 'Unable to save edits.');
      setSaving(false);
      return;
    }
    setBanner('Saved.');
    setSaving(false);
  };

  if (!options.length) {
    return (
      <div className="min-h-screen bg-[#fbf8f4] p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#171411] mb-3">Interview Prep Studio</h1>
          <p className="text-[#6e665f] mb-8">Prep for a specific interview stage at the company you&apos;re interviewing with — tied to your resume and the job analysis.</p>
          <div className="bg-white rounded-2xl p-8 border-2 border-[#e8e2db]">
            <h2 className="text-xl font-bold mb-2">Analyze a role first.</h2>
            <p className="text-[#6e665f] mb-6">We need a saved job analysis to tailor the question bank to this specific role and company.</p>
            <Link href="/analyzer" className="inline-block px-6 py-3 bg-[#171411] text-white rounded-xl font-semibold">Open the analyzer</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#fbf8f4] p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#171411] mb-3">Interview Prep Studio</h1>
          <p className="text-[#6e665f] mb-8">Company-specific question bank, STAR story matcher tied to your resume, and interviewer briefing — all for the job you&apos;re interviewing for next.</p>
          <div className="bg-white rounded-2xl p-8 border-2 border-[#e8e2db]">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4"><Lock className="w-6 h-6 text-amber-700" /></div>
            <h2 className="text-xl font-bold mb-2">Premium feature</h2>
            <p className="text-[#6e665f] mb-6">Interview Prep Studio is included with Premium and Lifetime plans. Current plan: <strong>{plan}</strong>.</p>
            <Link href="/pricing" className="inline-block px-6 py-3 bg-[#171411] text-white rounded-xl font-semibold">Upgrade to Premium</Link>
          </div>
        </div>
      </div>
    );
  }

  const content = (prep?.content as PrepContent) || null;

  return (
    <div className="min-h-screen bg-[#fbf8f4] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-xs font-bold text-[#84523c] uppercase tracking-widest mb-2">Workspace / Interview Prep</p>
          <h1 className="text-3xl font-extrabold text-[#171411] mb-2">Interview Prep Studio</h1>
          <p className="text-[#6e665f] max-w-3xl">Hiring-manager-grade prep tied to this specific job. No generic templates — every question and STAR seed is grounded in your resume evidence and the JD.</p>
        </header>

        <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Tracked role</label>
              <select
                className="w-full p-3 rounded-lg border border-[#d1d5db] bg-white text-sm"
                value={selectedOption?.id || ''}
                onChange={(e) => router.push(`/interview-prep?applicationId=${e.target.value}`)}
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>{o.jobTitle} — {o.company}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Interview stage</label>
              <select
                className="w-full p-3 rounded-lg border border-[#d1d5db] bg-white text-sm"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                {STAGE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !analysis}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#171411] text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {prep ? 'Regenerate' : 'Generate prep'}
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Interviewer name or LinkedIn URL (optional)</label>
            <textarea
              rows={2}
              value={interviewerNotes}
              onChange={(e) => setInterviewerNotes(e.target.value)}
              placeholder="e.g. Maria Chen, Director of Platform. Or paste her LinkedIn URL so we can tailor talking points."
              className="w-full p-3 rounded-lg border border-[#d1d5db] bg-white text-sm font-sans resize-y"
            />
          </div>

          {analysis && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#f1f5f9] text-[#475569] font-semibold">{analysis.jobTitle} @ {analysis.company}</span>
              {analysis.overallScore != null && <span className="px-3 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] font-semibold">Fit {analysis.overallScore}%</span>}
              {analysis.seniority && <span className="px-3 py-1 rounded-full bg-[#eef2ff] text-[#3730a3] font-semibold capitalize">{analysis.seniority}</span>}
              {analysis.concerns.length > 0 && <span className="px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] font-semibold">{analysis.concerns.length} recruiter concern{analysis.concerns.length === 1 ? '' : 's'}</span>}
            </div>
          )}
        </section>

        {(banner || error) && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${banner ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>{banner || error}</div>
        )}

        {content && (
          <>
            {content.summary && (
              <section className="bg-white rounded-2xl p-5 border border-[#e8e2db] mb-4">
                <p className="text-sm text-[#171411]"><strong>Coach&apos;s read:</strong> {content.summary}</p>
                {content.stage_context && (
                  <p className="mt-2 text-xs text-[#6e665f]">
                    ~{content.stage_context.duration_estimate_minutes} min · {content.stage_context.format} · Signal hunted: {content.stage_context.signal_hunted}
                  </p>
                )}
              </section>
            )}

            <nav className="flex gap-1 flex-wrap mb-4 border-b border-[#e5e7eb]">
              {([
                ['questions', `Questions (${content.questions?.length || 0})`],
                ['stories', `STAR stories (${content.star_stories?.length || 0})`],
                ['ask', `Ask back (${content.questions_to_ask?.length || 0})`],
                ['research', `Research (${content.company_research?.length || 0})`],
                ['flags', `Red flags (${content.red_flags_to_avoid?.length || 0})`],
                ['plan', '30-60-90 plan'],
              ] as [typeof activeTab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${activeTab === key ? 'border-[#171411] text-[#171411]' : 'border-transparent text-[#6e665f] hover:text-[#171411]'}`}
                >{label}</button>
              ))}
            </nav>

            {activeTab === 'questions' && (
              <div className="grid gap-3">
                {(content.questions || []).map((q, i) => {
                  const cat = CATEGORY_LABELS[q.category] || { label: q.category, color: '#64748b' };
                  return (
                    <article key={i} className="bg-white rounded-xl p-5 border border-[#e8e2db]">
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: cat.color }}>{cat.label}</span>
                        {q.competency && <span className="text-xs px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] font-semibold">{q.competency}</span>}
                        <span className="text-xs text-[#6e665f] capitalize">{q.difficulty}</span>
                      </div>
                      <p className="text-base font-bold text-[#171411] mb-2">{q.question}</p>
                      <p className="text-xs text-[#6e665f] mb-2"><strong>Why asked:</strong> {q.why_asked}</p>
                      <p className="text-sm text-[#3d362f]"><Lightbulb className="inline w-3.5 h-3.5 mr-1 text-amber-500" /><strong>Your angle:</strong> {q.prep_hint}</p>
                    </article>
                  );
                })}
              </div>
            )}

            {activeTab === 'stories' && (
              <div className="grid gap-3">
                {(content.star_stories || []).map((s, i) => (
                  <article key={i} className="bg-white rounded-xl p-5 border border-[#e8e2db]">
                    <h3 className="text-lg font-bold text-[#171411] mb-1">{s.title}</h3>
                    {s.competencies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {s.competencies.map((c, ci) => <span key={ci} className="text-[10px] px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#3730a3] font-bold">{c}</span>)}
                      </div>
                    )}
                    <p className="text-xs text-[#6e665f] mb-3"><em>Source bullet:</em> {s.source_bullet}</p>
                    <div className="grid gap-2 text-sm text-[#171411]">
                      <div><strong className="text-[#84523c] uppercase text-[10px] tracking-widest block mb-1">Situation</strong>{s.situation}</div>
                      <div><strong className="text-[#84523c] uppercase text-[10px] tracking-widest block mb-1">Task</strong>{s.task}</div>
                      <div><strong className="text-[#84523c] uppercase text-[10px] tracking-widest block mb-1">Action</strong>{s.action}</div>
                      <div><strong className="text-[#84523c] uppercase text-[10px] tracking-widest block mb-1">Result</strong>{s.result}</div>
                    </div>
                    {s.adaptability && <p className="mt-3 text-xs text-[#6e665f]"><Target className="inline w-3 h-3 mr-1" />{s.adaptability}</p>}
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'ask' && (
              <div className="grid gap-3">
                {(content.questions_to_ask || []).map((q, i) => (
                  <article key={i} className="bg-white rounded-xl p-5 border border-[#e8e2db]">
                    <p className="text-base font-bold text-[#171411] mb-1">{q.question}</p>
                    <p className="text-xs text-[#6e665f]"><strong>Signals:</strong> {q.what_it_signals}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-[#94a3b8] font-bold">{(q.type || '').replace(/_/g, ' ')}</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'research' && (
              <div className="grid gap-3">
                {(content.company_research || []).map((r, i) => (
                  <article key={i} className="bg-white rounded-xl p-5 border border-[#e8e2db]">
                    <p className="text-sm font-bold text-[#171411] mb-1">{r.topic}</p>
                    <p className="text-xs text-[#6e665f] mb-2"><strong>Where to find it:</strong> {r.source}</p>
                    <p className="text-xs text-[#3d362f]"><strong>How to use:</strong> {r.how_to_use}</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'flags' && (
              <div className="grid gap-3">
                {(content.red_flags_to_avoid || []).length === 0 && <p className="text-sm text-[#6e665f]">No recruiter-concern flags from the analysis.</p>}
                {(content.red_flags_to_avoid || []).map((r, i) => (
                  <article key={i} className="bg-white rounded-xl p-5 border border-amber-200 bg-amber-50/40">
                    <div className="flex gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" /><p className="text-sm font-bold text-amber-900">{r.concern}</p></div>
                    <p className="text-xs text-red-800 mb-1"><strong>Avoid:</strong> {r.avoid}</p>
                    <p className="text-xs text-emerald-800"><CheckCircle2 className="inline w-3 h-3 mr-1" /><strong>Replace with:</strong> {r.replace_with}</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="bg-white rounded-2xl p-6 border border-[#e8e2db]">
                {content.thirty_sixty_ninety_plan?.applicable ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {(['days_30', 'days_60', 'days_90'] as const).map((key, idx) => {
                      const label = key === 'days_30' ? 'First 30 days' : key === 'days_60' ? 'Days 30–60' : 'Days 60–90';
                      const items = content.thirty_sixty_ninety_plan?.[key] || [];
                      return (
                        <div key={key}>
                          <h4 className="text-sm font-bold text-[#171411] mb-2">{label}</h4>
                          <ol className="list-decimal pl-5 text-sm text-[#3d362f] space-y-1.5">
                            {items.map((it, i) => <li key={i}>{it}</li>)}
                          </ol>
                          {idx === 0 && <p className="mt-3 text-xs text-[#6e665f]">Adapt these — your specific scope will change what&apos;s realistic.</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[#6e665f]">A 30-60-90 plan isn&apos;t typical at this stage. Generate a prep for a Hiring Manager or Executive stage to get one.</p>
                )}
              </div>
            )}

            {(content.checklist?.length || content.confidence_coaching) && (
              <section className="mt-6 grid gap-4 md:grid-cols-2">
                {content.checklist && content.checklist.length > 0 && (
                  <article className="bg-white rounded-2xl p-5 border border-[#e8e2db]">
                    <h4 className="text-sm font-bold text-[#171411] mb-3 uppercase tracking-wider">Pre-interview checklist</h4>
                    <ul className="space-y-2 text-sm text-[#3d362f]">
                      {content.checklist.map((c, i) => (
                        <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /><span>{c}</span></li>
                      ))}
                    </ul>
                  </article>
                )}
                {content.confidence_coaching && (
                  <article className="bg-white rounded-2xl p-5 border border-[#e8e2db]">
                    <h4 className="text-sm font-bold text-[#171411] mb-3 uppercase tracking-wider">Confidence coaching</h4>
                    {content.confidence_coaching.framing_statement && (
                      <p className="text-sm text-[#3d362f] mb-2 italic">&ldquo;{content.confidence_coaching.framing_statement}&rdquo;</p>
                    )}
                    {content.confidence_coaching.body_language_notes && (
                      <p className="text-xs text-[#6e665f] mb-2"><strong>Body language:</strong> {content.confidence_coaching.body_language_notes}</p>
                    )}
                    {content.confidence_coaching.recovery_script && (
                      <p className="text-xs text-[#6e665f]"><strong>If you blank:</strong> {content.confidence_coaching.recovery_script}</p>
                    )}
                  </article>
                )}
              </section>
            )}

            {content.narrative_gaps && content.narrative_gaps.length > 0 && (
              <section className="mt-6 bg-white rounded-2xl p-5 border border-[#e8e2db]">
                <h4 className="text-sm font-bold text-[#171411] mb-3 uppercase tracking-wider">Narrative gaps — be ready</h4>
                <div className="space-y-3">
                  {content.narrative_gaps.map((g, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-bold text-[#171411]">{g.area}</p>
                      <p className="text-xs text-[#6e665f] mb-1"><strong>Risk:</strong> {g.risk}</p>
                      <p className="text-xs text-[#3d362f]"><strong>Handle with:</strong> {g.mitigation}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171411] text-white rounded-xl font-semibold text-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save edits
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
