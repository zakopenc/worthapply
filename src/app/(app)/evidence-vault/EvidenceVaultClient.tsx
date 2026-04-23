'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

export interface EvidenceItem {
  id: string;
  title: string;
  category: string;
  situation: string | null;
  action_taken: string | null;
  result: string | null;
  metrics: string[];
  skills: string[];
  tags: string[];
  confidence: number;
  needs_clarification: boolean;
  questions_to_improve: string[];
  created_at: string;
}

interface Props {
  plan: string;
  isPremium: boolean;
  initialItems: EvidenceItem[];
  hasResume: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  achievement:      { label: 'Achievement',     color: 'text-green-800',  bg: 'bg-green-50 border-green-200' },
  project:          { label: 'Project',         color: 'text-blue-800',   bg: 'bg-blue-50 border-blue-200' },
  leadership:       { label: 'Leadership',      color: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
  technical:        { label: 'Technical',       color: 'text-cyan-800',   bg: 'bg-cyan-50 border-cyan-200' },
  stakeholder:      { label: 'Stakeholder',     color: 'text-orange-800', bg: 'bg-orange-50 border-orange-200' },
  'problem-solving':{ label: 'Problem Solving', color: 'text-rose-800',   bg: 'bg-rose-50 border-rose-200' },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[];

const BLANK_FORM = {
  title: '', category: 'achievement', situation: '', action_taken: '', result: '',
  metrics: '', skills: '', confidence: 80,
};

function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category] || { label: category, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ConfidenceDot({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <span className="flex items-center gap-1 text-xs text-on-surface-variant">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {score}%
    </span>
  );
}

interface ItemCardProps {
  item: EvidenceItem;
  onEdit: (item: EvidenceItem) => void;
  onDelete: (id: string) => void;
}

function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
      item.needs_clarification ? 'border-amber-200' : 'border-outline-variant/20'
    }`}>
      <div className="px-5 py-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <CategoryBadge category={item.category} />
            {item.needs_clarification && (
              <span className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                <HelpCircle className="w-3 h-3" /> Needs detail
              </span>
            )}
          </div>
          <p className="font-bold text-on-surface text-sm leading-snug">{item.title}</p>
          {item.result && !expanded && (
            <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{item.result}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ConfidenceDot score={item.confidence} />
          <button
            onClick={() => onEdit(item)}
            className="w-7 h-7 rounded-lg border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="w-7 h-7 rounded-lg border border-outline-variant/30 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-on-surface-variant hover:text-red-600" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-outline-variant/10 pt-4 space-y-3">
          {item.situation && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Situation</p>
              <p className="text-sm text-on-surface leading-relaxed">{item.situation}</p>
            </div>
          )}
          {item.action_taken && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Action</p>
              <p className="text-sm text-on-surface leading-relaxed">{item.action_taken}</p>
            </div>
          )}
          {item.result && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Result</p>
              <p className="text-sm text-on-surface leading-relaxed">{item.result}</p>
            </div>
          )}
          {item.metrics?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.metrics.map((m, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
                  {m}
                </span>
              ))}
            </div>
          )}
          {item.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-on-surface-variant text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
          {item.needs_clarification && item.questions_to_improve?.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Strengthen this item</p>
              <ul className="space-y-1">
                {item.questions_to_improve.map((q, i) => (
                  <li key={i} className="text-xs text-amber-800 flex gap-2">
                    <span className="shrink-0 font-bold">→</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FormDrawerProps {
  initial?: Partial<typeof BLANK_FORM & { id?: string }>;
  onClose: () => void;
  onSave: (item: EvidenceItem) => void;
}

function FormDrawer({ initial, onClose, onSave }: FormDrawerProps) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({ ...BLANK_FORM, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = isEdit
      ? {
          id: initial?.id,
          title: form.title,
          category: form.category,
          situation: form.situation || undefined,
          action_taken: form.action_taken || undefined,
          result: form.result || undefined,
          metrics: form.metrics ? form.metrics.split(',').map((s) => s.trim()).filter(Boolean) : [],
          skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          confidence: Number(form.confidence),
        }
      : {
          action: 'create',
          title: form.title,
          category: form.category,
          situation: form.situation || undefined,
          action_taken: form.action_taken || undefined,
          result: form.result || undefined,
          metrics: form.metrics ? form.metrics.split(',').map((s) => s.trim()).filter(Boolean) : [],
          skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          confidence: Number(form.confidence),
        };

    const res = await fetch('/api/evidence', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Failed to save'); return; }
    onSave(data.data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <h2 className="text-lg font-extrabold text-on-surface">{isEdit ? 'Edit item' : 'Add evidence item'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Reduced customer churn by 23%"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">Category *</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-outline-variant/30 text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 pr-9"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          {['situation', 'action_taken', 'result'].map((field) => (
            <div key={field}>
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">
                {field === 'action_taken' ? 'Action' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <textarea
                rows={2}
                value={(form as Record<string, string>)[field]}
                onChange={(e) => set(field, e.target.value)}
                placeholder={field === 'situation' ? 'Context and background' : field === 'action_taken' ? 'What you specifically did' : 'What happened as a result'}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">Metrics (comma-separated)</label>
            <input
              value={form.metrics}
              onChange={(e) => set('metrics', e.target.value)}
              placeholder="e.g. 23% increase, $1.2M ARR, 40% faster"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5 block">Skills (comma-separated)</label>
            <input
              value={form.skills}
              onChange={(e) => set('skills', e.target.value)}
              placeholder="e.g. Python, stakeholder management"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#1f2937] to-secondary text-white rounded-xl text-sm font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isEdit ? 'Save changes' : 'Add to vault'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EvidenceVaultClient({ plan, isPremium, initialItems, hasResume }: Props) {
  const [items, setItems] = useState<EvidenceItem[]>(initialItems);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractBanner, setExtractBanner] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<EvidenceItem | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.category === filter);
  const needsClarification = items.filter((i) => i.needs_clarification).length;

  async function handleExtract() {
    setExtracting(true);
    setExtractError('');
    setExtractBanner('');
    const res = await fetch('/api/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extract' }),
    });
    const data = await res.json();
    setExtracting(false);
    if (!res.ok) { setExtractError(data.error || 'Extraction failed'); return; }
    setItems((prev) => [...(data.data || []), ...prev]);
    setExtractBanner(`Extracted ${data.count} evidence items from your resume.`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this evidence item?')) return;
    await fetch(`/api/evidence?id=${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSaved(saved: EvidenceItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen p-6 lg:p-10">
        <header className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">WorthApply / Evidence Vault</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">Evidence Vault</h1>
          <p className="text-on-surface-variant mt-1 max-w-2xl">
            Your reusable bank of achievements, projects, and stories — extracted from your resume and used across every application.
          </p>
        </header>
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-purple-700" />
          </div>
          <h2 className="text-2xl font-extrabold text-on-surface mb-3">Premium feature</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            Evidence Vault is available on the Premium plan. Build a reusable story bank from your resume and use it across every tailoring, outreach, and interview prep session.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#1f2937] to-secondary text-white rounded-xl text-sm font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Premium — $79/mo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">WorthApply / Evidence Vault</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">Evidence Vault</h1>
            <p className="text-on-surface-variant mt-1 max-w-2xl">
              {items.length === 0
                ? "Build your reusable story bank. Extract from your resume or add items manually."
                : `${items.length} evidence item${items.length !== 1 ? 's' : ''} — used across tailoring, outreach, and interview prep.`}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {hasResume && (
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant/30 text-on-surface rounded-xl text-sm font-bold hover:bg-surface-container-low active:scale-95 transition-all disabled:opacity-50"
              >
                {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-secondary" />}
                Extract from resume
              </button>
            )}
            <button
              onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1f2937] to-secondary text-white rounded-xl text-sm font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add item
            </button>
          </div>
        </div>
      </header>

      {extractError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{extractError}</p>
        </div>
      )}
      {extractBanner && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">{extractBanner}</p>
        </div>
      )}
      {needsClarification > 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-amber-800 text-sm font-medium">
            {needsClarification} item{needsClarification !== 1 ? 's' : ''} could be stronger — expand them to see suggested questions.
          </p>
        </div>
      )}

      {items.length === 0 && !extracting ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-on-surface-variant">
          <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/20 flex items-center justify-center mb-4">
            <BookMarked className="w-6 h-6 text-on-surface-variant/40" />
          </div>
          <p className="font-bold text-on-surface mb-1">Your vault is empty</p>
          <p className="text-sm max-w-sm">
            {hasResume
              ? 'Click "Extract from resume" to auto-populate your vault, or add items manually.'
              : 'Upload and process your resume first, or add evidence items manually.'}
          </p>
          {!hasResume && (
            <Link href="/resume" className="mt-4 text-secondary font-bold text-sm underline">
              Go to Resume & Evidence →
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', ...CATEGORIES].map((cat) => {
              const count = cat === 'all' ? items.length : items.filter((i) => i.category === cat).length;
              if (count === 0 && cat !== 'all') return null;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    filter === cat
                      ? 'bg-on-surface text-white border-on-surface'
                      : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60'
                  }`}
                >
                  {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat]?.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(i) => {
                  setEditItem(i);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {(showForm || editItem) && (
        <FormDrawer
          initial={editItem
            ? {
                id: editItem.id,
                title: editItem.title,
                category: editItem.category,
                situation: editItem.situation || '',
                action_taken: editItem.action_taken || '',
                result: editItem.result || '',
                metrics: (editItem.metrics || []).join(', '),
                skills: (editItem.skills || []).join(', '),
                confidence: editItem.confidence,
              }
            : undefined}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}
