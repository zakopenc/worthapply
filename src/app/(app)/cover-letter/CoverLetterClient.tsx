'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Loader2, Lock, Sparkles } from 'lucide-react';
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

export interface CoverLetterRecord {
  id: string;
  recommendation: 'skip' | 'short-note' | 'full-letter';
  content: string | null;
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

export default function CoverLetterClient({ plan, options, analysis, initialCoverLetter }: CoverLetterClientProps) {
  const router = useRouter();
  const isPaid = plan === 'pro' || plan === 'premium' || plan === 'lifetime';
  const planLabel = plan === 'lifetime' ? 'Lifetime access' : plan === 'premium' ? 'Premium access' : plan === 'pro' ? 'Pro access' : 'Free verdict only';
  const [coverLetter, setCoverLetter] = useState<GeneratedCoverLetter | null>(initialCoverLetter);
  const [draft, setDraft] = useState(initialCoverLetter?.content || '');
  const [reasoning, setReasoning] = useState('');
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedOption = useMemo(() => options.find((option) => option.id === analysis?.applicationId) || null, [analysis?.applicationId, options]);

  useEffect(() => {
    setCoverLetter(initialCoverLetter);
    setDraft(initialCoverLetter?.content || '');
    setReasoning('');
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
      body: JSON.stringify({ application_id: analysis.applicationId, analysis_id: analysis.id }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to generate a cover letter right now.');
      setLoading(false);
      return;
    }

    const nextCoverLetter = payload.data as GeneratedCoverLetter;
    setCoverLetter(nextCoverLetter);
    setDraft(nextCoverLetter.content || '');
    setReasoning(nextCoverLetter.reasoning || '');
    setBanner(isPaid ? 'Cover letter draft generated and saved.' : 'Verdict saved. Upgrade to unlock the full draft.');
    setLoading(false);
  };

  const handleDownloadTxt = () => {
    if (!draft.trim() || !analysis) return;
    downloadBlob(
      buildDownloadFilename([analysis.jobTitle, analysis.company], 'cover-letter', 'txt'),
      new Blob([draft], { type: 'text/plain;charset=utf-8' })
    );
  };

  const handleDownloadDocx = async () => {
    if (!draft.trim() || !analysis) return;

    const blob = await buildParagraphDocxBlob(
      draft.split(/\n{2,}/).map((block, index) => ({
        heading: index === 0 ? 'Cover Letter' : undefined,
        body: block.replace(/\n/g, ' '),
      }))
    );

    downloadBlob(buildDownloadFilename([analysis.jobTitle, analysis.company], 'cover-letter', 'docx'), blob);
  };

  const handleDownloadPdf = async () => {
    if (!draft.trim() || !analysis) return;

    const blob = await buildSimplePdfBlob(`${analysis.jobTitle} — ${analysis.company}`, [
      {
        heading: 'Cover Letter',
        body: draft,
      },
    ]);

    downloadBlob(buildDownloadFilename([analysis.jobTitle, analysis.company], 'cover-letter', 'pdf'), blob);
  };

  if (!options.length) {
    return (
      <div className={styles.page}>
        <section className={styles.emptyState}>
          <div className={styles.sectionEyebrow}>Cover letter workflow</div>
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

  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <div className={styles.heroContent}>
          <div className={styles.sectionEyebrow}>Job context</div>
          <h2 className={styles.heroTitle}>{analysis?.jobTitle || selectedOption?.jobTitle}</h2>
          <div className={styles.contextRow}>
            <span className={styles.pill}>{analysis?.company || selectedOption?.company}</span>
            <span className={styles.pill}>{recommendationLabel(coverLetter?.recommendation)}</span>
            <span className={styles.pill}>{verdictLabel(analysis?.verdict)}</span>
            {analysis?.overallScore != null ? <span className={styles.pill}>Fit score {analysis.overallScore}%</span> : null}
          </div>
          <p className={styles.heroText}>
            Use your saved job analysis to decide whether this role deserves a cover letter and, on Pro, turn that context into an editable draft.
          </p>
        </div>

        <div className={styles.heroActions}>
          <label className={styles.selectLabel} htmlFor="cover-letter-role">Role</label>
          <select
            id="cover-letter-role"
            className={styles.select}
            value={selectedOption?.id || ''}
            onChange={(event) => router.push(`/cover-letter?applicationId=${event.target.value}`)}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.jobTitle} — {option.company}
              </option>
            ))}
          </select>
          <button type="button" className={styles.primaryButton} onClick={handleGenerate} disabled={loading || !analysis}>
            {loading ? <Loader2 size={16} className={styles.spin} /> : <Sparkles size={16} />}
            {coverLetter ? 'Regenerate' : 'Generate'}
          </button>
        </div>
      </section>

      {(banner || error) ? (
        <div className={banner ? styles.successBanner : styles.errorBanner}>{banner || error}</div>
      ) : null}

      <section className={styles.grid}>
        <article className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <span className={styles.sectionEyebrow}>Recommendation</span>
            <FileText size={18} />
          </div>
          <h3 className={styles.summaryTitle}>{recommendationLabel(coverLetter?.recommendation)}</h3>
          <p className={styles.summaryText}>
            {reasoning || (isPaid
              ? 'Generate a draft to get a role-aware recommendation and editable cover letter.'
              : 'Free plans can save the verdict only. Upgrade when you want the full generated letter.')}
          </p>
          <div className={styles.metaList}>
            <div className={styles.metaRow}><span>Plan</span><strong>{planLabel}</strong></div>
            <div className={styles.metaRow}><span>Saved version</span><strong>{coverLetter?.version ? `v${coverLetter.version}` : '—'}</strong></div>
            <div className={styles.metaRow}><span>Last updated</span><strong>{formatTimestamp(coverLetter?.createdAt)}</strong></div>
          </div>
        </article>

        {isPaid ? (
          <article className={styles.editorCard}>
            <div className={styles.editorHeader}>
              <div>
                <div className={styles.sectionEyebrow}>Editable draft</div>
                <h3 className={styles.editorTitle}>Generated cover letter</h3>
              </div>
              <div className={styles.actionRow}>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadTxt} disabled={!draft.trim()}>
                  <Download size={16} /> Download TXT
                </button>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadDocx} disabled={!draft.trim()}>
                  <Download size={16} /> Download DOCX
                </button>
                <button type="button" className={styles.secondaryButton} onClick={handleDownloadPdf} disabled={!draft.trim()}>
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>
            <textarea
              className={styles.textarea}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Generate a cover letter draft to start editing."
            />
          </article>
        ) : (
          <article className={styles.upgradeCard}>
            <div className={styles.lockWrap}><Lock size={20} /></div>
            <div className={styles.sectionEyebrow}>Paid unlock</div>
            <h3 className={styles.editorTitle}>Upgrade to generate the full letter</h3>
            <p className={styles.summaryText}>
              Your free workspace can save the recommendation verdict, but the complete editable draft and download options are reserved for Pro, Premium, and Lifetime.
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
