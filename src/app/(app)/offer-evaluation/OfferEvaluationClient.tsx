'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Sparkles, Copy, AlertTriangle } from 'lucide-react';

export interface OfferEvaluationOption {
  id: string;
  jobTitle: string;
  company: string;
  location: string | null;
  status: string | null;
}

export interface OfferEvaluationRecord {
  id: string;
  applicationId: string | null;
  offerText: string | null;
  parsedOffer: Record<string, unknown>;
  projection: Record<string, unknown>;
  negotiation: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
}

interface YearRow { base: number; bonus: number; signing: number; equity_vested: number; total: number }
interface ScenarioObj { year_1: YearRow; year_2: YearRow; year_3: YearRow; year_4: YearRow; cumulative: number; assumptions: string }
interface Projection { conservative?: ScenarioObj; base?: ScenarioObj; optimistic?: ScenarioObj }

interface Benchmark {
  confidence?: 'high' | 'medium' | 'low';
  confidence_reason?: string;
  expected_base_p25_p50_p75?: number[];
  expected_tc_p25_p50_p75?: number[];
  this_offer_tc_percentile_estimate?: number;
  above_market_items?: string[];
  below_market_items?: string[];
  caveats?: string;
}

interface Lever {
  lever: string;
  flexibility: 'low' | 'medium' | 'high';
  rationale: string;
  ask_amount: string;
  justification_script: string;
}

interface OfferEvaluationClientProps {
  plan: string;
  isPremium: boolean;
  options: OfferEvaluationOption[];
  selectedApplicationId: string | null;
  initialEvaluation: OfferEvaluationRecord | null;
}

function fmtMoney(n: number | null | undefined) {
  if (n == null) return '—';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export default function OfferEvaluationClient({ plan, isPremium, options, selectedApplicationId, initialEvaluation }: OfferEvaluationClientProps) {
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<OfferEvaluationRecord | null>(initialEvaluation);
  const [offerText, setOfferText] = useState(initialEvaluation?.offerText || '');
  const [currentBase, setCurrentBase] = useState<string>('');
  const [currentTc, setCurrentTc] = useState<string>('');
  const [competingOffers, setCompetingOffers] = useState<string>('');
  const [priorities, setPriorities] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');
  const [scriptTab, setScriptTab] = useState<'email' | 'phone' | 'rebuttals'>('email');
  const [copyConfirm, setCopyConfirm] = useState('');

  const selectedOption = useMemo(() => options.find((o) => o.id === selectedApplicationId) || null, [options, selectedApplicationId]);

  useEffect(() => {
    setEvaluation(initialEvaluation);
    setOfferText(initialEvaluation?.offerText || '');
    setBanner('');
    setError('');
  }, [initialEvaluation, selectedApplicationId]);

  const handleEvaluate = async () => {
    setLoading(true);
    setError('');
    setBanner('');
    const priorityList = priorities.split(',').map((p) => p.trim()).filter(Boolean).slice(0, 10);
    const response = await fetch('/api/offer-evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: selectedApplicationId || undefined,
        offer_text: offerText.trim() || undefined,
        role_context: selectedOption
          ? { job_title: selectedOption.jobTitle, company: selectedOption.company, location: selectedOption.location || undefined }
          : {},
        candidate_context: {
          current_base: currentBase ? Number(currentBase) : undefined,
          current_total_comp: currentTc ? Number(currentTc) : undefined,
          competing_offer_count: competingOffers ? Number(competingOffers) : undefined,
          top_priorities: priorityList.length ? priorityList : undefined,
        },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || 'Unable to evaluate this offer.');
      setLoading(false);
      return;
    }
    setEvaluation(payload.data as OfferEvaluationRecord);
    setBanner('Evaluation ready.');
    setLoading(false);
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyConfirm(label);
      setTimeout(() => setCopyConfirm(''), 2000);
    } catch {
      setError('Clipboard copy blocked. Select and copy manually.');
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#fbf8f4] p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#171411] mb-3">Offer Evaluation & Negotiation</h1>
          <p className="text-[#6e665f] mb-8">Paste your offer, get a 4-year total-comp projection with equity scenarios, prioritized negotiation levers, and the exact email + phone scripts to counter.</p>
          <div className="bg-white rounded-2xl p-8 border-2 border-[#e8e2db]">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4"><Lock className="w-6 h-6 text-amber-700" /></div>
            <h2 className="text-xl font-bold mb-2">Premium feature</h2>
            <p className="text-[#6e665f] mb-6">Offer Evaluation is included with Premium and Lifetime. Current plan: <strong>{plan}</strong>.</p>
            <Link href="/pricing" className="inline-block px-6 py-3 bg-[#171411] text-white rounded-xl font-semibold">Upgrade to Premium</Link>
          </div>
        </div>
      </div>
    );
  }

  const parsed = (evaluation?.parsedOffer as Record<string, unknown> | undefined) || null;
  const projection = (evaluation?.projection as Projection | undefined) || null;
  const negotiation = (evaluation?.negotiation as { email_counter?: string; phone_script?: string[]; rebuttal_lines?: { pushback: string; response: string }[] } | undefined) || null;
  const meta = (evaluation?.metadata as { headline?: string; benchmark_analysis?: Benchmark; negotiation_levers?: Lever[]; common_mistakes_to_avoid?: string[]; red_alerts?: { alert: string; severity: string; action: string }[]; next_steps?: string[]; decision_matrix?: { applicable: boolean; dimensions: { dimension: string; this_offer_score: string; verify_before_deciding: string; question_to_ask_team: string }[] } } | undefined) || null;
  const equity = parsed?.equity as Record<string, unknown> | undefined;
  const base = parsed?.base_salary_annual as number | undefined;
  const signing = parsed?.signing_bonus as number | undefined;
  const bonusPct = parsed?.annual_bonus_target_percent as number | undefined;

  return (
    <div className="min-h-screen bg-[#fbf8f4] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-xs font-bold text-[#84523c] uppercase tracking-widest mb-2">Workspace / Offer Evaluation</p>
          <h1 className="text-3xl font-extrabold text-[#171411] mb-2">Offer Evaluation & Negotiation</h1>
          <p className="text-[#6e665f] max-w-3xl">This tool works for you, not the employer. Paste the offer, answer a few questions, and get a rigorous 4-year projection plus the exact script to ask for more.</p>
        </header>

        <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Link to a tracked role (optional)</label>
              <select
                className="w-full p-3 rounded-lg border border-[#d1d5db] bg-white text-sm"
                value={selectedApplicationId || ''}
                onChange={(e) => router.push(e.target.value ? `/offer-evaluation?applicationId=${e.target.value}` : '/offer-evaluation')}
              >
                <option value="">— Standalone (no tracker link) —</option>
                {options.map((o) => <option key={o.id} value={o.id}>{o.jobTitle} — {o.company}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Paste your offer text (letter, Greenhouse page, email body)</label>
            <textarea
              rows={8}
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="Paste the full offer text including base, signing bonus, equity (RSU/options), vesting, benefits…"
              className="w-full p-3 rounded-lg border border-[#d1d5db] bg-white text-sm font-mono resize-y"
            />
          </div>
          <div className="grid md:grid-cols-4 gap-3 mt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Current base</label>
              <input type="number" value={currentBase} onChange={(e) => setCurrentBase(e.target.value)} placeholder="150000" className="w-full p-2 rounded-lg border border-[#d1d5db] bg-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Current total comp</label>
              <input type="number" value={currentTc} onChange={(e) => setCurrentTc(e.target.value)} placeholder="210000" className="w-full p-2 rounded-lg border border-[#d1d5db] bg-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Competing offers</label>
              <input type="number" value={competingOffers} onChange={(e) => setCompetingOffers(e.target.value)} placeholder="1" className="w-full p-2 rounded-lg border border-[#d1d5db] bg-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">Top priorities (comma-separated)</label>
              <input type="text" value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder="cash, scope, remote, learning" className="w-full p-2 rounded-lg border border-[#d1d5db] bg-white text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={handleEvaluate} disabled={loading || !offerText.trim()} className="inline-flex items-center gap-2 px-6 py-3 bg-[#171411] text-white rounded-xl font-semibold disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {evaluation ? 'Re-evaluate' : 'Evaluate offer'}
            </button>
          </div>
        </section>

        {(banner || error || copyConfirm) && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${(banner || copyConfirm) ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {copyConfirm || banner || error}
          </div>
        )}

        {meta?.headline && (
          <section className="bg-white rounded-2xl p-5 border border-[#e8e2db] mb-4">
            <p className="text-sm font-bold text-[#171411]">{meta.headline}</p>
          </section>
        )}

        {(meta?.red_alerts?.length || 0) > 0 && (
          <section className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Red alerts · {meta!.red_alerts!.length}</h3>
            <div className="space-y-2">
              {meta!.red_alerts!.map((r, i) => (
                <div key={i} className="text-sm text-red-900">
                  <strong>[{r.severity}]</strong> {r.alert}
                  <p className="text-xs text-red-800 mt-0.5">Action: {r.action}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {parsed && (
          <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-4">Parsed offer</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#6e665f]">Base</p>
                <p className="text-lg font-bold text-[#171411]">{fmtMoney(base)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6e665f]">Signing</p>
                <p className="text-lg font-bold text-[#171411]">{fmtMoney(signing)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6e665f]">Annual bonus target</p>
                <p className="text-lg font-bold text-[#171411]">{bonusPct != null ? `${bonusPct}%` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#6e665f]">Equity ({(equity?.type as string) || 'n/a'})</p>
                <p className="text-lg font-bold text-[#171411]">{fmtMoney(equity?.total_grant_value_usd as number | null | undefined)}</p>
              </div>
            </div>
            {equity?.vesting_schedule ? <p className="mt-3 text-xs text-[#6e665f]"><strong>Vesting:</strong> {String(equity.vesting_schedule)}</p> : null}
            {(parsed.missing_info_flags as string[] | undefined)?.length ? (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Missing info — ask about these before signing</p>
                <ul className="text-xs text-amber-800 list-disc pl-5">
                  {(parsed.missing_info_flags as string[]).map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ) : null}
          </section>
        )}

        {projection && (
          <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-4">4-year total comp projection</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {(['conservative', 'base', 'optimistic'] as const).map((key) => {
                const s = projection[key];
                if (!s) return null;
                const label = key === 'conservative' ? 'Conservative' : key === 'base' ? 'Base case' : 'Optimistic';
                const color = key === 'conservative' ? 'bg-slate-50 border-slate-200 text-slate-900' : key === 'base' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900';
                return (
                  <article key={key} className={`rounded-xl p-4 border ${color}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-2xl font-extrabold">{fmtMoney(s.cumulative)}</p>
                    <p className="text-xs mt-1">over 4 years</p>
                    <div className="mt-3 space-y-1 text-xs">
                      {[s.year_1, s.year_2, s.year_3, s.year_4].map((y, i) => (
                        <div key={i} className="flex justify-between">
                          <span>Y{i + 1}</span>
                          <span className="font-semibold">{fmtMoney(y?.total)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs italic opacity-80">{s.assumptions}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {meta?.benchmark_analysis && (
          <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-3">Benchmark analysis</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {meta.benchmark_analysis.expected_tc_p25_p50_p75 && (
                <div>
                  <p className="text-xs text-[#6e665f] mb-1">Expected TC range (p25 / p50 / p75)</p>
                  <p className="text-base font-bold text-[#171411]">
                    {meta.benchmark_analysis.expected_tc_p25_p50_p75.map(fmtMoney).join(' / ')}
                  </p>
                </div>
              )}
              {meta.benchmark_analysis.this_offer_tc_percentile_estimate != null && (
                <div>
                  <p className="text-xs text-[#6e665f] mb-1">This offer ≈</p>
                  <p className="text-base font-bold text-[#171411]">{meta.benchmark_analysis.this_offer_tc_percentile_estimate}th percentile</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#6e665f] mb-1">Confidence</p>
                <p className="text-base font-bold text-[#171411] capitalize">{meta.benchmark_analysis.confidence || 'unknown'}</p>
              </div>
            </div>
            {(meta.benchmark_analysis.above_market_items?.length || 0) > 0 && (
              <p className="text-xs text-emerald-800 mt-3"><strong>Above market:</strong> {meta.benchmark_analysis.above_market_items!.join('; ')}</p>
            )}
            {(meta.benchmark_analysis.below_market_items?.length || 0) > 0 && (
              <p className="text-xs text-amber-800 mt-1"><strong>Below market:</strong> {meta.benchmark_analysis.below_market_items!.join('; ')}</p>
            )}
            {meta.benchmark_analysis.caveats && (
              <p className="text-xs text-[#6e665f] mt-2 italic">{meta.benchmark_analysis.caveats}</p>
            )}
          </section>
        )}

        {(meta?.negotiation_levers?.length || 0) > 0 && (
          <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-4">Negotiation levers · ranked</h3>
            <div className="grid gap-3">
              {meta!.negotiation_levers!.map((l, i) => {
                const flexColor = l.flexibility === 'high' ? 'bg-emerald-100 text-emerald-800' : l.flexibility === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700';
                return (
                  <article key={i} className="border border-[#e5e7eb] rounded-xl p-4">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="text-sm font-bold text-[#171411]">{i + 1}. {l.lever}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${flexColor}`}>{l.flexibility} flexibility</span>
                    </div>
                    <p className="text-sm text-[#3d362f] mb-2"><strong>Ask:</strong> {l.ask_amount}</p>
                    <p className="text-xs text-[#6e665f] mb-1"><strong>Why there&apos;s room:</strong> {l.rationale}</p>
                    <p className="text-xs text-[#3d362f]"><strong>Script angle:</strong> {l.justification_script}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {negotiation && (negotiation.email_counter || negotiation.phone_script || negotiation.rebuttal_lines) && (
          <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569]">Negotiation script</h3>
            </div>
            <div className="flex gap-1 border-b border-[#e5e7eb] mb-4">
              {(['email', 'phone', 'rebuttals'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setScriptTab(t)}
                  className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 -mb-px ${scriptTab === t ? 'border-[#171411] text-[#171411]' : 'border-transparent text-[#6e665f]'}`}
                >{t}</button>
              ))}
            </div>
            {scriptTab === 'email' && negotiation.email_counter && (
              <div>
                <button type="button" onClick={() => copy(negotiation.email_counter!, 'Email counter copied to clipboard.')} className="inline-flex items-center gap-1 text-xs font-bold text-[#475569] mb-3 hover:text-[#171411]"><Copy className="w-3 h-3" /> Copy email</button>
                <pre className="whitespace-pre-wrap text-sm text-[#171411] font-sans leading-relaxed bg-[#fafaf8] p-4 rounded-lg border border-[#e5e7eb]">{negotiation.email_counter}</pre>
              </div>
            )}
            {scriptTab === 'phone' && (negotiation.phone_script?.length || 0) > 0 && (
              <div>
                <button type="button" onClick={() => copy(negotiation.phone_script!.join('\n• '), 'Phone script copied to clipboard.')} className="inline-flex items-center gap-1 text-xs font-bold text-[#475569] mb-3 hover:text-[#171411]"><Copy className="w-3 h-3" /> Copy script</button>
                <ol className="list-decimal pl-6 space-y-2 text-sm text-[#171411]">
                  {negotiation.phone_script!.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </div>
            )}
            {scriptTab === 'rebuttals' && (negotiation.rebuttal_lines?.length || 0) > 0 && (
              <div className="grid gap-3">
                {negotiation.rebuttal_lines!.map((r, i) => (
                  <article key={i} className="border border-[#e5e7eb] rounded-lg p-3">
                    <p className="text-xs text-[#6e665f] mb-1"><em>If they say:</em> &ldquo;{r.pushback}&rdquo;</p>
                    <p className="text-sm text-[#171411]"><strong>You say:</strong> {r.response}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {meta?.decision_matrix?.applicable && (meta.decision_matrix.dimensions?.length || 0) > 0 && (
          <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-4">Decision matrix</h3>
            <div className="grid gap-3">
              {meta.decision_matrix.dimensions.map((d, i) => (
                <article key={i} className="border border-[#e5e7eb] rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <strong>{d.dimension}</strong>
                    <span className="text-[#6e665f]">{d.this_offer_score}</span>
                  </div>
                  <p className="text-xs text-[#6e665f] mb-1"><strong>Verify:</strong> {d.verify_before_deciding}</p>
                  <p className="text-xs text-[#3d362f]"><strong>Ask them:</strong> {d.question_to_ask_team}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {(meta?.common_mistakes_to_avoid?.length || 0) > 0 && (
          <section className="bg-white rounded-2xl p-6 border border-[#e8e2db] mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-3">Avoid these</h3>
            <ul className="list-disc pl-5 text-sm text-[#3d362f] space-y-1">
              {meta!.common_mistakes_to_avoid!.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </section>
        )}

        {(meta?.next_steps?.length || 0) > 0 && (
          <section className="bg-[#171411] text-white rounded-2xl p-6 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3">Your next 72 hours</h3>
            <ol className="list-decimal pl-5 text-sm space-y-1.5">
              {meta!.next_steps!.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
