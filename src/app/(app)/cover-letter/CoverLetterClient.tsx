'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Loader2, Lock, Save, Sparkles } from 'lucide-react';
import {
  buildDownloadFilename,
  buildParagraphDocxBlob,
  buildSimplePdfBlob,
  downloadBlob,
} from '@/lib/client-document-export';
import styles from './cover-letter.module.css';

export interface CoverLetterWorkspaceOption {
  id: string;
  jobTitle: string;
  company: string;
  analysisId: string;
  createdAt: string;
}

export interface CoverLetterWorkspaceAnalysis {
  id: string;
  applicationId: string;
  jobTitle: string;
  company: string;
  overallScore: number | null;
  verdict: 'apply' | 'low-priority' | 'skip' | null;
}

type IndustryPreset = 'tech_startup' | 'enterprise_tech' | 'finance_law' | 'academia' | 'nonprofit' | 'creative' | 'public_sector' | 'general';

interface CoverLetterMetadata {
  structure_format?: string;
  tone_preset_used?: string;
  opener_type?: string;
  concerns_addressed?: string[];
  needs_company_signal?: boolean;
  company_signal_question?: string;
  ai_tell_flags?: string[];
  key_points_addressed?: string[];
  user_company_signal?: string;
  reasoning?: string;
}

export interface CoverLetterRecord {
  id: string;
  recommendation: 'skip' | 'short-note' | 'full-letter';
  content: string | null;
  email_body_content?: string | null;
  metadata?: CoverLetterMetadata | null;
  version: number;
  createdAt: string | null;
}

interface GeneratedCoverLetter extends CoverLetterRecord {
  reasoning?: string;
  upgrade_required?: boolean;
  plan?: string;
}

interface CoverLetterClientProps {
  plan: string;
  options: CoverLetterWorkspaceOption[];
  analysis: CoverLetterWorkspaceAnalysis | null;
  initialCoverLetter: CoverLetterRecord | null;
}

const INDUSTRY_LABELS: { value: IndustryPreset; label: string }[] = [
  { value: 'general', label: 'General / default' },
  { value: 'tech_startup', label: 'Tech startup' },
  { value: 'enterprise_tech', label: 'Enterprise tech' },
  { value: 'finance_law', label: 'Finance / Law' },
  { value: 'academia', label: 'Academia' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'creative', label: 'Creative / Design' },
  { value: 'public_sector', label: 'Public sector' },
];

function recommendationLabel(value?: string | null) {
  if (value === 'full-letter') return 'Full letter recommended';
  if (value === 'short-note') return 'Short note recommended';
  if (value === 'skip') return 'Skip the cover letter';
  return 'No recommendation yet';
}

function verdictLabel(value?: string | null) {
  if (value === 'apply') return 'Stronger fit';
  if (value === 'low-priority') return 'Selective fit';
  if (value === 'skip') return 'Low fit';
  return 'Awaiting fit verdict';
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'Not generated yet';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function CoverLetterClient({ plan, options, analysis, initialCoverLetter }: CoverLetterClientProps) {
  const router = useRouter();
  const isPaid = plan === 'pro' || plan === 'premium';
  const planLabel = plan === 'premium' ? 'Premium access' : plan === 'pro' ? 'Pro access' : 'Free verdict only';
  const [coverLetter, setCoverLetter] = useState<GeneratedCoverLetter | null>(initialCoverLetter);
  const [draft, setDraft] = useState(initialCoverLetter?.content || '');
  const [emailDraft, setEmailDraft] = useState(initialCoverLetter?.email_body_content || '');
  const [reasoning, setReasoning] = useState('');
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'attached' | 'email'>('attached');
  const [industryPreset, setIndustryPreset] = useState<IndustryPreset>('general');
  const [companySignal, setCompanySignal] = useState(initialCoverLetter?.metadata?.user_company_signal || '');

  const selectedOption = useMemo(() => options.find((option) => option.id === analysis?.applicationId) || null, [analysis?.applicationId, options]);

  useEffect(() => {
    setCoverLetter(initialCoverLetter);
    setDraft(initialCoverLetter?.content || '');
    setEmailDraft(initialCoverLetter?.email_body_content || '');
    setReasoning(initialCoverLetter?.metadata?.reasoning || '');
    setCompanySignal(initialCoverLetter?.metadata?.user_company_signal || '');
    setBanner('');
    setError('');
  }, [initialCoverLetter, analysis?.applicationId]);

  const handleGenerate = async () => {
    if (!analysis) {
      setError('Select a role with an analysis before generating a cover letter.');
      return;
    }

    setLoading(true);
    setError('');
    setBanner('');

    const response = await fetch('/api/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: analysis.applicationId,
        analysis_id: analysis.id,
        industry_preset: industryPreset,
        user_company_signal: companySignal.trim() || undefined,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 429 && payload.rate_limited && typeof payload.retry_after_seconds === 'number') {
        const secs = Math.max(1, payload.retry_after_seconds);
        const upgrade = payload.upgrade_hint ? ` ${payload.upgrade_hint}` : '';
        setError(`You're clicking faster than we generate. Try again in ${secs}s.${upgrade}`);
        startRetryCountdown(secs);
      } else {
        setError(payload.error || 'Unable to generate a cover letter right now.');
      }
      setLoading(false);
      return;
    }

    const nextCoverLetter = payload.data as GeneratedCoverLetter;
    setCoverLetter(nextCoverLetter);
    setDraft(nextCoverLetter.content || '');
    setEmailDraft(nextCoverLetter.email_body_content || '');
    setReasoning(nextCoverLetter.reasoning || nextCoverLetter.metadata?.reasoning || '');
    setBanner(isPaid ? 'Cover letter draft generated and saved.' : 'Verdict saved. Upgrade to unlock the full draft.');
    setLoading(false);
  };

  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const startRetryCountdown = (seconds: number) => {
    setRetryCountdown(seconds);
  };

  useEffect(() => {
    if (retryCountdown <= 0) return;
    const id = window.setInterval(() => {
      setRetryCountdown((s) => {
        const next = s - 1;
        if (next <= 0) {
          setError('');
          return 0;
        }
        setError((current) => current.replace(/in \d+s\./, `in ${next}s.`));
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [retryCountdown]);

  const handleSaveEdits = async () => {
    if (!analysis || !coverLetter) return;
    setSaving(true);
    setError('');
    setBanner('');

    const response = await fetch('/api/cover-letter', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: analysis.applicationId,
        analysis_id: analysis.id,
        recommendation: coverLetter.recommendation,
        content: draft,
        email_body_content: emailDraft,
        metadata: coverLetter.metadata || {},
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to save your edits.');
      setSaving(false);
      return;
    }

    const saved = payload.data as GeneratedCoverLetter;
    setCoverLetter({ ...coverLetter, ...saved });
    setBanner(`Saved as v${saved.version}.`);
    setSaving(false);
  };

  const handleDownloadTxt = () => {
    if (!analysis) return;
    const text = activeTab === 'email' ? emailDraft : draft;
    if (!text.trim()) return;
    downloadBlob(
      buildDownloadFilename([analysis.jobTitle, analysis.company], activeTab === 'email' ? 'cover-letter-email' : 'cover-letter', 'txt'),
      new Blob([text], { type: 'text/plain;charset=utf-8' })
    );
  };

  const handleDownloadDocx = async () => {
    if (!analysis) return;
    const text = activeTab === 'email' ? emailDraft : draft;
    if (!text.trim()) return;

    const blob = await buildParagraphDocxBlob(
      text.split(/\n{2,}/).map((block) => ({
        body: block.replace(/\n/g, ' '),
      }))
    );

    downloadBlob(buildDownloadFilename([analysis.jobTitle, analysis.company], activeTab === 'email' ? 'cover-letter-email' : 'cover-letter', 'docx'), blob);
  };

  const handleDownloadPdf = async () => {
    if (!analysis) return;
    const text = activeTab === 'email' ? emailDraft : draft;
    if (!text.trim()) return;

    const blob = await buildSimplePdfBlob(`${analysis.jobTitle} — ${analysis.company}`, [
      { body: text },
    ]);

    downloadBlob(buildDownloadFilename([analysis.jobTitle, analysis.company], activeTab === 'email' ? 'cover-letter-email' : 'cover-letter', 'pdf'), blob);
  };

  const handleCopyEmail = async () => {
    if (!emailDraft.trim()) return;
    try {
      await navigator.clipboard.writeText(emailDraft);
      setBanner('Email body copied to clipboard.');
    } catch {
      setError('Clipboard copy blocked. Select and copy manually.');
    }
  };

  const metadata = coverLetter?.metadata || null;
  const needsSignal = !!metadata?.needs_company_signal;
  const aiFlags = metadata?.ai_tell_flags || [];
  const concernsAddressed = metadata?.concerns_addressed || [];
  const openerType = metadata?.opener_type;
  const structureFormat = metadata?.structure_format;

  const activeText = activeTab === 'email' ? emailDraft : draft;
  const targetMin = activeTab === 'email' ? 150 : (coverLetter?.recommendation === 'short-note' ? 120 : 280);
  const targetMax = activeTab === 'email' ? 220 : (coverLetter?.recommendation === 'short-note' ? 180 : 350);
  const wordCount = countWords(activeText);
  const inRange = wordCount >= targetMin && wordCount <= targetMax;

  if (!options.length) {
    return (
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Cover Letter</h1>
          <p className={styles.pageDesc}>Generate a role-aware recommendation or full draft based on your job analysis.</p>
        </header>
        <section className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>You need an analyzed role before you can build a cover letter.</h2>
          <p className={styles.emptyText}>Run a job fit analysis first, then come back here to generate a recommendation or full draft.</p>
          <div className={styles.actionRow}>
            <Link href="/analyzer" className={styles.primaryButton}>Analyze a role</Link>
            <Link href="/applications" className={styles.secondaryButton}>Open applications</Link>
          </div>
        </section>
      </div>
    );
  }

  const recClass =
    coverLetter?.recommendation === 'full-letter' ? styles.recommendBadgeFull
    : coverLetter?.recommendation === 'short-note' ? styles.recommendBadgeShort
    : coverLetter?.recommendation === 'skip' ? styles.recommendBadgeSkip
    : styles.recommendBadgeNeutral;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.pageEyebrow}>Workspace · Cover Letter</p>
        <h1 className={styles.pageTitle}>Cover Letter</h1>
        <p className={styles.pageDesc}>Hiring-manager-grade letters grounded in your resume, tailored for this specific role.</p>
      </header>

      {/* ─── Role switcher ─── */}
      <section className={styles.roleSwitcher}>
        <span className={styles.roleSwitcherLabel}>Viewing</span>
        <select
          id="cover-letter-role"
          aria-label="Select role"
          value={selectedOption?.id || ''}
          onChange={(event) => router.push(`/cover-letter?applicationId=${event.target.value}`)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.jobTitle} — {option.company}
            </option>
          ))}
        </select>
      </section>

      {/* ─── Selected role card (professional exec summary) ─── */}
      <section className={styles.roleCard}>
        <div className={styles.roleHeader}>
          <div>
            <p className={styles.roleEyebrow}>Selected role</p>
            <h2 className={styles.roleTitle}>{analysis?.jobTitle || selectedOption?.jobTitle}</h2>
            <div className={styles.roleMeta}>
              <strong>{analysis?.company || selectedOption?.company}</strong>
              {coverLetter && (
                <>
                  <span className={styles.roleMetaSep}>·</span>
                  <span>Version {coverLetter.version} · {formatTimestamp(coverLetter.createdAt)}</span>
                </>
              )}
            </div>
          </div>
          <span className={`${styles.recommendBadge} ${recClass}`}>
            {recommendationLabel(coverLetter?.recommendation)}
          </span>
        </div>

        <div className={styles.statGrid}>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>Fit score</span>
            <span className={styles.statValue}>
              {analysis?.overallScore != null ? `${analysis.overallScore}%` : '—'}
            </span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>Verdict</span>
            <span className={styles.statValue} style={{ fontSize: 16 }}>{verdictLabel(analysis?.verdict)}</span>
          </div>
          <div className={styles.statCell}>
            <span className={styles.statLabel}>Your plan</span>
            <span className={styles.statValue} style={{ fontSize: 16 }}>{planLabel}</span>
          </div>
          {structureFormat && (
            <div className={styles.statCell}>
              <span className={styles.statLabel}>Structure</span>
              <span className={styles.statValue} style={{ fontSize: 16, textTransform: 'capitalize' }}>{String(structureFormat).replace(/_/g, ' ')}</span>
            </div>
          )}
          {openerType && openerType !== 'none' && (
            <div className={styles.statCell}>
              <span className={styles.statLabel}>Opener</span>
              <span className={styles.statValue} style={{ fontSize: 16, textTransform: 'capitalize' }}>{String(openerType).replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>
      </section>

      {/* ─── Controls: industry tone + company signal ─── */}
      {isPaid && (
        <section className={styles.controlsGrid}>
          <div className={styles.controlCard}>
            <label className={styles.controlLabel} htmlFor="industry-preset">Industry tone</label>
            <select
              id="industry-preset"
              value={industryPreset}
              onChange={(e) => setIndustryPreset(e.target.value as IndustryPreset)}
            >
              {INDUSTRY_LABELS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className={styles.controlHint}>Shifts formality, contractions, vocabulary density.</p>
          </div>
          <div className={styles.controlCard}>
            <label className={styles.controlLabel} htmlFor="company-signal">Why this company specifically?</label>
            <textarea
              id="company-signal"
              rows={3}
              value={companySignal}
              onChange={(e) => setCompanySignal(e.target.value)}
              placeholder="e.g. a product launch, a CTO blog post, a recent Series B, a strategic pivot — something specific you noticed."
            />
            <p className={styles.controlHint}>One specific thing beats ten generic mentions. We won&apos;t invent one for you.</p>
          </div>
        </section>
      )}

      {/* ─── Big, visible Generate CTA ─── */}
      {isPaid && (
        <section className={styles.generateSection}>
          <div className={styles.generateText}>
            <h3 className={styles.generateTitle}>
              {coverLetter ? 'Regenerate with your latest inputs' : 'Ready to generate your draft?'}
            </h3>
            <p className={styles.generateSubtitle}>
              {coverLetter
                ? 'Updates tone, opener, and company signal based on current settings. Edits are preserved on the editor below until you save.'
                : 'Problem–Solution structure, mandatory quantified or company-specific opener, AI-tell lint, email-body variant, and edit-save versioning — all in one pass.'}
            </p>
            <div className={styles.generateMeta}>
              <span><strong>Tone:</strong> {INDUSTRY_LABELS.find((l) => l.value === industryPreset)?.label}</span>
              {companySignal.trim() && <span><strong>Signal:</strong> {companySignal.slice(0, 60)}{companySignal.length > 60 ? '…' : ''}</span>}
              {!companySignal.trim() && <span style={{ color: 'rgba(255,255,255,0.45)' }}>No company signal provided — we&apos;ll prompt if needed.</span>}
            </div>
          </div>
          <button
            type="button"
            className={styles.generateButton}
            onClick={handleGenerate}
            disabled={loading || !analysis}
          >
            {loading ? <Loader2 size={20} className={styles.spin} /> : <Sparkles size={20} />}
            {loading ? 'Generating…' : coverLetter ? 'Regenerate draft' : 'Generate cover letter'}
          </button>
        </section>
      )}

      {/* Free plan: shorter CTA banner that upgrades */}
      {!isPaid && (
        <section className={styles.generateSection}>
          <div className={styles.generateText}>
            <h3 className={styles.generateTitle}>Get a recommendation verdict now</h3>
            <p className={styles.generateSubtitle}>
              Free plans see whether a cover letter is worth writing. Full drafts with tone presets, email variants, and AI-tell lint unlock on Pro or Premium.
            </p>
          </div>
          <button
            type="button"
            className={styles.generateButton}
            onClick={handleGenerate}
            disabled={loading || !analysis}
          >
            {loading ? <Loader2 size={20} className={styles.spin} /> : <Sparkles size={20} />}
            {loading ? 'Loading…' : coverLetter ? 'Regenerate verdict' : 'Get verdict'}
          </button>
        </section>
      )}

      {(banner || error) ? (
        <div className={banner ? styles.successBanner : styles.errorBanner}>{banner || error}</div>
      ) : null}

      {needsSignal && metadata?.company_signal_question && (
        <div style={{ padding: 16, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ flexShrink: 0, marginTop: 2, width: 24, height: 24, borderRadius: 999, background: '#d97706', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</span>
          <div style={{ flex: 1, fontSize: 14, color: '#78350f' }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>Add a company-specific signal to make this land</strong>
            <span>{metadata.company_signal_question}</span>
            <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: '#92400e' }}>Fill the &quot;Why this company&quot; field above and regenerate. We won&apos;t invent a hook for you.</span>
          </div>
        </div>
      )}

      <section className={styles.grid}>
        <article className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <span className={styles.sectionEyebrow}>Coach&apos;s read</span>
            <FileText size={18} />
          </div>
          <p className={styles.summaryText}>
            {reasoning || (isPaid
              ? 'Generate a draft to get a role-aware recommendation and editable cover letter.'
              : 'Free plans can save the verdict only. Upgrade when you want the full generated letter.')}
          </p>

          {(aiFlags.length > 0 || concernsAddressed.length > 0) && (
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {aiFlags.length > 0 && (
                <div style={{ padding: 10, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8 }}>
                  <strong style={{ display: 'block', fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: '#991b1b', marginBottom: 4 }}>AI tells detected · {aiFlags.length}</strong>
                  <ul style={{ fontSize: 12, color: '#7f1d1d', margin: 0, paddingLeft: 16 }}>
                    {aiFlags.slice(0, 4).map((flag, i) => <li key={i}>{flag}</li>)}
                  </ul>
                </div>
              )}
              {concernsAddressed.length > 0 && (
                <div style={{ padding: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8 }}>
                  <strong style={{ display: 'block', fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: '#047857', marginBottom: 4 }}>Concerns addressed · {concernsAddressed.length}</strong>
                  <ul style={{ fontSize: 12, color: '#064e3b', margin: 0, paddingLeft: 16 }}>
                    {concernsAddressed.slice(0, 3).map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </article>

        {isPaid ? (
          <article className={styles.editorCard}>
            <div className={styles.editorHeader}>
              <div>
                <div className={styles.sectionEyebrow}>Editable draft</div>
                <h3 className={styles.editorTitle}>Generated cover letter</h3>
              </div>
              <div className={styles.actionRow}>
                <button type="button" className={styles.secondaryButton} onClick={handleSaveEdits} disabled={saving || !coverLetter}>
                  {saving ? <Loader2 size={16} className={styles.spin} /> : <Save size={16} />} Save as new version
                </button>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadTxt} disabled={!activeText.trim()}>
                  <Download size={16} /> TXT
                </button>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadDocx} disabled={!activeText.trim()}>
                  <Download size={16} /> DOCX
                </button>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadPdf} disabled={!activeText.trim()}>
                  <Download size={16} /> PDF
                </button>
              </div>
            </div>

            <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 12 }}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'attached'}
                onClick={() => setActiveTab('attached')}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'attached' ? '2px solid #0f172a' : '2px solid transparent',
                  fontWeight: activeTab === 'attached' ? 700 : 500,
                  color: activeTab === 'attached' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Attached letter
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'email'}
                onClick={() => setActiveTab('email')}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'email' ? '2px solid #0f172a' : '2px solid transparent',
                  fontWeight: activeTab === 'email' ? 700 : 500,
                  color: activeTab === 'email' ? '#0f172a' : '#64748b',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Email body
              </button>
              {activeTab === 'email' && (
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  disabled={!emailDraft.trim()}
                  style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 13, color: '#0f172a', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Copy to clipboard
                </button>
              )}
            </div>

            <textarea
              className={styles.textarea}
              value={activeTab === 'email' ? emailDraft : draft}
              onChange={(event) => activeTab === 'email' ? setEmailDraft(event.target.value) : setDraft(event.target.value)}
              placeholder={activeTab === 'email' ? 'A 150–220 word email-body variant that fits one mobile screen.' : 'Generate a cover letter draft to start editing.'}
            />

            <div style={{ marginTop: 8, fontSize: 12, color: inRange ? '#047857' : '#b45309' }}>
              {wordCount} words · target {targetMin}–{targetMax} {activeTab === 'email' ? '(fits one mobile screen)' : '(one page)'}
              {!inRange && wordCount > 0 && (
                <span style={{ marginLeft: 8 }}>
                  {wordCount > targetMax ? '— consider cutting' : '— add specificity, not padding'}
                </span>
              )}
            </div>
          </article>
        ) : (
          <article className={styles.upgradeCard}>
            <div className={styles.lockWrap}><Lock size={20} /></div>
            <div className={styles.sectionEyebrow}>Paid unlock</div>
            <h3 className={styles.editorTitle}>Upgrade to generate the full letter</h3>
            <p className={styles.summaryText}>
              Your free workspace can save the recommendation verdict, but the complete editable draft, email body variant, and download options are reserved for Pro and Premium plans.
            </p>
            <div className={styles.actionRow}>
              <Link href="/pricing" className={styles.primaryButton}>Upgrade to generate full letter</Link>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
