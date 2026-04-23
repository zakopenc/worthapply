'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  Lock,
  Send,
  Sparkles,
  AlertTriangle,
  ThumbsUp,
} from 'lucide-react';

export interface OutreachWorkspaceOption {
  id: string;
  jobTitle: string;
  company: string;
  analysisId: string;
  createdAt: string;
}

interface OutreachResult {
  suggest_outreach: boolean;
  why: string;
  best_target_order: string[];
  recruiter_message: string;
  referral_message: string;
  short_linkedin_message: string;
  follow_up_message: string;
  why_this_message_works: string[];
  things_to_avoid: string[];
  best_time_to_send: string;
  confidence: number;
}

interface Props {
  plan: string;
  options: OutreachWorkspaceOption[];
  initialApplicationId: string | null;
}

type TargetType = 'recruiter' | 'hiring_manager' | 'employee_referral' | 'alumni';
type Goal = 'ask_referral' | 'introduce_candidacy' | 'follow_up_after_applying' | 'get_conversation';

const TARGET_OPTIONS: { value: TargetType; label: string; desc: string }[] = [
  { value: 'employee_referral', label: 'Employee Referral', desc: 'Someone who works there' },
  { value: 'recruiter', label: 'Recruiter', desc: 'Internal or agency recruiter' },
  { value: 'hiring_manager', label: 'Hiring Manager', desc: 'Direct manager for the role' },
  { value: 'alumni', label: 'Alumni Contact', desc: 'Shared school or company' },
];

const GOAL_OPTIONS: { value: Goal; label: string; desc: string }[] = [
  { value: 'ask_referral', label: 'Ask for a referral', desc: 'Get formally referred before applying' },
  { value: 'introduce_candidacy', label: 'Introduce candidacy', desc: "Let them know you're applying" },
  { value: 'follow_up_after_applying', label: 'Follow up after applying', desc: 'Sent after submitting an application' },
  { value: 'get_conversation', label: 'Request a conversation', desc: 'Ask for a quick call or coffee chat' },
];

const TARGET_LABEL_MAP: Record<string, string> = {
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  employee_referral: 'Employee Referral',
  alumni: 'Alumni',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-on-surface-variant border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-colors"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function MessageCard({ label, message, index }: { label: string; message: string; index?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
      <div className="px-5 py-3 border-b border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary text-[10px] font-black flex items-center justify-center">
              {index}
            </span>
          )}
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
        </div>
        <CopyButton text={message} />
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}

export default function OutreachClient({ plan, options, initialApplicationId }: Props) {
  const isPaid = plan === 'pro' || plan === 'premium';

  const [selectedId, setSelectedId] = useState<string>(initialApplicationId || '');
  const [targetType, setTargetType] = useState<TargetType>('employee_referral');
  const [goal, setGoal] = useState<Goal>('ask_referral');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OutreachResult | null>(null);

  const selectedOption = options.find((o) => o.id === selectedId) || null;

  async function handleGenerate() {
    if (!selectedOption) return;
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: selectedOption.analysisId,
          application_id: selectedOption.id,
          target_type: targetType,
          goal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate outreach plan');
      setResult(data.data);
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">
          WorthApply / Outreach Copilot
        </p>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
          Outreach Copilot
        </h1>
        <p className="text-on-surface-variant mt-1 max-w-2xl">
          Generate a recruiter message, referral ask, or follow-up sequence grounded in your actual experience — not generic templates.
        </p>
      </header>

      {!isPaid ? (
        <div className="max-w-xl mx-auto mt-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="text-2xl font-extrabold text-on-surface mb-3">Pro feature</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            Outreach Copilot is available on the Pro and Premium plans. Upgrade to generate recruiter messages, referral asks, and follow-up sequences tied to your real experience.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#1f2937] to-secondary text-white rounded-xl text-sm font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro — from $39/mo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left: Form */}
          <div className="xl:col-span-4 flex flex-col gap-5">

            {/* Job selector */}
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Select job</p>
              {options.length === 0 ? (
                <div className="text-sm text-on-surface-variant">
                  No analyzed jobs yet.{' '}
                  <Link href="/analyzer" className="text-secondary font-bold underline">
                    Analyze a role first.
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
                    className="w-full appearance-none bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 pr-9 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  >
                    <option value="">— Pick a job —</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.jobTitle} @ {o.company}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Target type */}
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Who are you reaching out to?</p>
              <div className="flex flex-col gap-2">
                {TARGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTargetType(opt.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      targetType === opt.value
                        ? 'border-secondary bg-secondary/5'
                        : 'border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                      targetType === opt.value ? 'border-secondary bg-secondary' : 'border-outline-variant/40'
                    }`}>
                      {targetType === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{opt.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">What&apos;s the goal?</p>
              <div className="flex flex-col gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      goal === opt.value
                        ? 'border-secondary bg-secondary/5'
                        : 'border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                      goal === opt.value ? 'border-secondary bg-secondary' : 'border-outline-variant/40'
                    }`}>
                      {goal === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{opt.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedId}
              className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#1f2937] to-secondary text-white rounded-xl text-sm font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Send className="w-4 h-4" /> Generate Outreach Plan</>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div className="xl:col-span-8 flex flex-col gap-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-on-surface-variant">
                <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/20 flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-on-surface-variant/40" />
                </div>
                <p className="font-bold text-on-surface mb-1">No outreach plan yet</p>
                <p className="text-sm">Select a job, choose your target and goal, then generate.</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-on-surface-variant">
                <Loader2 className="w-8 h-8 animate-spin text-secondary mb-4" />
                <p className="font-bold text-on-surface">Crafting your outreach plan...</p>
                <p className="text-sm mt-1">Using your resume and fit analysis to write targeted messages.</p>
              </div>
            )}

            {result && !loading && (
              <>
                {/* Verdict banner */}
                <div className={`rounded-2xl border p-5 flex items-start gap-4 ${
                  result.suggest_outreach
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    result.suggest_outreach ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {result.suggest_outreach
                      ? <ThumbsUp className="w-4 h-4 text-green-700" />
                      : <AlertTriangle className="w-4 h-4 text-amber-700" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black mb-0.5 ${result.suggest_outreach ? 'text-green-900' : 'text-amber-900'}`}>
                      {result.suggest_outreach ? 'Outreach recommended' : 'Outreach not recommended'}
                    </p>
                    <p className={`text-sm leading-relaxed ${result.suggest_outreach ? 'text-green-800' : 'text-amber-800'}`}>
                      {result.why}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {result.best_target_order.map((t, i) => (
                        <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/70 border border-outline-variant/20 text-on-surface">
                          <span className="text-secondary font-black">{i + 1}</span>
                          {TARGET_LABEL_MAP[t] || t}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2">
                      Best time: {result.best_time_to_send} · Confidence: {result.confidence}%
                    </p>
                  </div>
                </div>

                {/* Messages — context-aware based on target type */}
                {(targetType === 'recruiter' || targetType === 'hiring_manager') && result.recruiter_message && (
                  <MessageCard
                    label={targetType === 'hiring_manager' ? 'Hiring manager message' : 'Recruiter message'}
                    message={result.recruiter_message}
                    index={1}
                  />
                )}
                {(targetType === 'employee_referral' || targetType === 'alumni') && result.referral_message && (
                  <MessageCard
                    label={targetType === 'alumni' ? 'Alumni outreach' : 'Referral ask'}
                    message={result.referral_message}
                    index={1}
                  />
                )}
                {result.short_linkedin_message && (
                  <MessageCard label="LinkedIn connection note (≤150 chars)" message={result.short_linkedin_message} index={2} />
                )}
                {result.follow_up_message && (
                  <MessageCard label="Follow-up (5–7 days)" message={result.follow_up_message} index={3} />
                )}

                {/* Why it works */}
                {result.why_this_message_works?.length > 0 && (
                  <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-green-800 mb-3">Why this works</p>
                    <ul className="space-y-2">
                      {result.why_this_message_works.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-900">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Things to avoid */}
                {result.things_to_avoid?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Things to avoid</p>
                    <ul className="space-y-2">
                      {result.things_to_avoid.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-on-surface">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-surface-container border border-outline-variant/20 text-on-surface-variant rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-container-low transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Regenerate
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
