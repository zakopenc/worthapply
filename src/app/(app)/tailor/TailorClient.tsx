'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  FileSearch,
  FileText,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { createClient } from '@/lib/supabase/client';
import styles from './tailor.module.css';

interface ParsedWorkHistoryItem {
  company?: string;
  title?: string;
  start?: string;
  end?: string;
  start_date?: string;
  end_date?: string;
  highlights?: string[];
}

interface ParsedEducationItem {
  institution?: string;
  degree?: string;
  field?: string;
  year?: string;
}

interface ParsedResumeData {
  summary?: string;
  achievements?: { text?: string }[];
  skills?: Record<string, string[]> | { category?: string; items?: string[] }[];
  work_history?: ParsedWorkHistoryItem[];
  education?: ParsedEducationItem[];
  leadership?: { text?: string; title?: string; story?: string }[];
  leadership_stories?: { text?: string; title?: string; story?: string }[];
}

interface TailoredContent {
  tailored_summary?: string;
  tailored_bullets?: { original: string; tailored: string; reason: string }[];
  reordered_skills?: string[];
}

interface TailoredResumeRecord {
  id: string;
  application_id: string;
  analysis_id: string;
  version: number;
  original_score: number;
  tailored_score: number;
  content: TailoredContent | null;
  ats_check?: { passed?: boolean; issues?: string[]; keywords_matched?: string[] } | null;
  tone_check?: { passed?: boolean; flags?: string[] } | null;
  created_at?: string;
}

interface ApplicationDetail {
  id: string;
  job_title: string;
  company: string;
  location?: string | null;
  analysis_id: string;
  overall_score?: number | null;
  analysis?: {
    overall_score: number;
    verdict: string;
    matched_skills?: { skill: string; evidence_from_resume?: string; evidence?: string }[];
    skill_gaps?: { skill: string; suggestion?: string; impact?: string }[];
    ats_keywords?: string[];
    recruiter_concerns?: { concern: string; severity: string; mitigation?: string }[];
  } | null;
  tailored?: TailoredResumeRecord | null;
}

export interface TailorApplicationOption {
  id: string;
  analysis_id: string;
  job_title: string;
  company: string;
  location?: string | null;
  overall_score?: number | null;
  created_at: string;
}

export interface TailorInitialData {
  plan: 'free' | 'pro' | 'premium' | 'lifetime';
  userName: string;
  features: {
    before_after_score: boolean;
    docx_download: boolean;
    natural_voice_pass: boolean;
    ats_format_check: boolean;
  };
  usage: {
    used: number;
    limit: number | null;
  };
  activeResume: {
    id: string;
    filename: string;
    parse_status: string;
    parsed_data: Record<string, unknown> | null;
  } | null;
  applications: TailorApplicationOption[];
}

type SuggestionState = 'pending' | 'accepted' | 'rejected';

type BulletDecision = {
  original: string;
  reason: string;
  value: string;
  state: SuggestionState;
};

function formatPlan(plan: TailorInitialData['plan']) {
  if (plan === 'lifetime') return 'Lifetime';
  if (plan === 'premium') return 'Premium';
  if (plan === 'pro') return 'Pro';
  return 'Free';
}

function formatDate(value?: string | null) {
  if (!value) return 'Just now';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeSkills(skills: ParsedResumeData['skills']) {
  if (!skills) return [] as { category: string; items: string[] }[];
  if (Array.isArray(skills)) {
    return skills.map((group) => ({
      category: group.category || 'Skills',
      items: group.items || [],
    }));
  }

  return Object.entries(skills)
    .filter(([, items]) => Array.isArray(items) && items.length > 0)
    .map(([category, items]) => ({
      category: category.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      items,
    }));
}

function buildExportLines(detail: ApplicationDetail, summaryDecision: { value: string; state: SuggestionState }, bulletDecisions: BulletDecision[], skillsDecision: { value: string[]; state: SuggestionState }) {
  const lines: { heading?: string; body?: string }[] = [];

  lines.push({ heading: 'Target Role', body: `${detail.job_title} — ${detail.company}` });

  if (summaryDecision.state === 'accepted' && summaryDecision.value.trim()) {
    lines.push({ heading: 'Professional Summary', body: summaryDecision.value.trim() });
  }

  const acceptedBullets = bulletDecisions.filter((item) => item.state === 'accepted' && item.value.trim());
  if (acceptedBullets.length > 0) {
    lines.push({ heading: 'Tailored Experience Highlights', body: acceptedBullets.map((item) => `• ${item.value.trim()}`).join('\n') });
  }

  if (skillsDecision.state === 'accepted' && skillsDecision.value.length > 0) {
    lines.push({ heading: 'Prioritized Skills', body: skillsDecision.value.join(', ') });
  }

  if (lines.length === 1) {
    lines.push({ heading: 'Notes', body: 'No accepted changes yet. Review and accept suggestions before exporting.' });
  }

  return lines;
}

function getOriginalResumeSections(resume: ParsedResumeData | null) {
  if (!resume) return [] as { key: string; label: string; body: string[] }[];

  const sections: { key: string; label: string; body: string[] }[] = [];

  if (resume.summary?.trim()) {
    sections.push({ key: 'summary', label: 'Professional Summary', body: [resume.summary.trim()] });
  }

  const workHistory = resume.work_history || [];
  if (workHistory.length > 0) {
    sections.push({
      key: 'work_history',
      label: 'Work History',
      body: workHistory.flatMap((item) => {
        const heading = [item.title, item.company].filter(Boolean).join(' — ');
        const dates = [item.start || item.start_date, item.end || item.end_date].filter(Boolean).join(' to ');
        const bullets = item.highlights?.length ? item.highlights.map((highlight) => `• ${highlight}`) : ['• No highlights extracted'];
        return [heading || 'Role details missing', dates || 'Dates unavailable', ...bullets];
      }),
    });
  }

  const achievements = resume.achievements || [];
  if (achievements.length > 0) {
    sections.push({
      key: 'achievements',
      label: 'Achievements',
      body: achievements.map((item) => `• ${item.text || 'Achievement details unavailable'}`),
    });
  }

  const skillGroups = normalizeSkills(resume.skills);
  if (skillGroups.length > 0) {
    sections.push({
      key: 'skills',
      label: 'Skills',
      body: skillGroups.map((group) => `${group.category}: ${group.items.join(', ')}`),
    });
  }

  const education = resume.education || [];
  if (education.length > 0) {
    sections.push({
      key: 'education',
      label: 'Education',
      body: education.map((item) => [item.degree, item.field, item.institution, item.year].filter(Boolean).join(' — ')),
    });
  }

  const leadership = resume.leadership || resume.leadership_stories || [];
  if (leadership.length > 0) {
    sections.push({
      key: 'leadership',
      label: 'Leadership',
      body: leadership.map((item) => item.text || item.title || item.story || 'Leadership item'),
    });
  }

  return sections;
}

export default function TailorClient({ initialData }: { initialData: TailorInitialData }) {
  const supabase = useMemo(() => createClient(), []);
  const [selectedApplicationId, setSelectedApplicationId] = useState(initialData.applications[0]?.id || '');
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');
  const [usage, setUsage] = useState(initialData.usage);
  const [summaryDecision, setSummaryDecision] = useState({ value: '', state: 'pending' as SuggestionState });
  const [bulletDecisions, setBulletDecisions] = useState<BulletDecision[]>([]);
  const [skillsDecision, setSkillsDecision] = useState({ value: [] as string[], state: 'pending' as SuggestionState });

  const selectedOption = useMemo(
    () => initialData.applications.find((application) => application.id === selectedApplicationId) || null,
    [initialData.applications, selectedApplicationId]
  );

  const parsedResume = (initialData.activeResume?.parsed_data as ParsedResumeData | null) ?? null;
  const originalSections = useMemo(() => getOriginalResumeSections(parsedResume), [parsedResume]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedApplicationId || !selectedOption?.analysis_id) {
        setDetail(null);
        return;
      }

      setLoadingDetail(true);
      setError('');

      const [applicationResponse, analysisResponse, tailoredResponse] = await Promise.all([
        supabase
          .from('applications')
          .select('id, job_title, company, location, analysis_id')
          .eq('id', selectedApplicationId)
          .single(),
        supabase
          .from('job_analyses')
          .select('overall_score, verdict, matched_skills, skill_gaps, recruiter_concerns')
          .eq('id', selectedOption.analysis_id)
          .single(),
        supabase
          .from('tailored_resumes')
          .select('id, application_id, analysis_id, version, original_score, tailored_score, content, ats_check, tone_check, created_at')
          .eq('application_id', selectedApplicationId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (applicationResponse.error || !applicationResponse.data) {
        setError(applicationResponse.error?.message || 'Unable to load this application.');
        setLoadingDetail(false);
        return;
      }

      setDetail({
        ...(applicationResponse.data as ApplicationDetail),
        analysis: (analysisResponse.data as ApplicationDetail['analysis']) || null,
        tailored: (tailoredResponse.data as TailoredResumeRecord | null) || null,
      });
      setLoadingDetail(false);
    };

    loadDetail();
  }, [selectedApplicationId, selectedOption?.analysis_id, supabase]);

  useEffect(() => {
    const tailoredContent = detail?.tailored?.content;
    setSummaryDecision({
      value: tailoredContent?.tailored_summary || '',
      state: tailoredContent?.tailored_summary ? 'pending' : 'rejected',
    });
    setBulletDecisions(
      (tailoredContent?.tailored_bullets || []).map((item) => ({
        original: item.original,
        reason: item.reason,
        value: item.tailored,
        state: 'pending' as SuggestionState,
      }))
    );
    setSkillsDecision({
      value: tailoredContent?.reordered_skills || [],
      state: tailoredContent?.reordered_skills?.length ? 'pending' : 'rejected',
    });
  }, [detail?.tailored?.content]);

  const handleGenerate = async () => {
    if (!detail?.analysis_id) return;

    setGenerating(true);
    setError('');
    setBanner('');

    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: detail.id, analysis_id: detail.analysis_id }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to generate tailored suggestions.');
      setGenerating(false);
      return;
    }

    setBanner('New tailoring suggestions are ready for review.');
    if (payload.data?.usage) {
      setUsage(payload.data.usage);
    }

    const tailored = payload.data as TailoredResumeRecord & { usage?: { used: number; limit: number | null } };
    setDetail((current) => current ? { ...current, tailored } : current);
    setGenerating(false);
  };

  const handleSaveAcceptedChanges = async () => {
    if (!detail?.tailored) return;

    setSaving(true);
    setError('');
    setBanner('');

    const acceptedContent: TailoredContent = {
      tailored_summary: summaryDecision.state === 'accepted' ? summaryDecision.value.trim() : '',
      tailored_bullets: bulletDecisions
        .filter((item) => item.state === 'accepted' && item.value.trim())
        .map((item) => ({
          original: item.original,
          tailored: item.value.trim(),
          reason: item.reason,
        })),
      reordered_skills: skillsDecision.state === 'accepted' ? skillsDecision.value : [],
    };

    const response = await fetch('/api/tailor', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: detail.id,
        analysis_id: detail.analysis_id,
        content: acceptedContent,
        original_score: detail.tailored.original_score,
        tailored_score: detail.tailored.tailored_score,
        ats_check: detail.tailored.ats_check,
        tone_check: detail.tailored.tone_check,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to save accepted changes.');
      setSaving(false);
      return;
    }

    setDetail((current) => current ? { ...current, tailored: payload.data as TailoredResumeRecord } : current);
    setBanner('Accepted changes saved as a new tailored resume version.');
    setSaving(false);
  };

  const handleExportDocx = async () => {
    if (!detail) return;
    if (!initialData.features.docx_download) {
      setError('DOCX export is available on Pro, Premium, and Lifetime plans.');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const sections = buildExportLines(detail, summaryDecision, bulletDecisions, skillsDecision);
      const doc = new Document({
        sections: [
          {
            children: sections.flatMap((section) => {
              const children: Paragraph[] = [];
              if (section.heading) {
                children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_2, spacing: { after: 120 } }));
              }
              if (section.body) {
                children.push(
                  ...section.body.split('\n').map((line) => new Paragraph({
                    children: [new TextRun({ text: line })],
                    spacing: { after: 120 },
                  }))
                );
              }
              return children;
            }),
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${detail.company}-${detail.job_title}-tailored-resume.docx`.replace(/\s+/g, '-').toLowerCase();
      anchor.click();
      URL.revokeObjectURL(url);
      setBanner('DOCX export downloaded.');
    } catch {
      setError('Unable to export the DOCX file on this device.');
    } finally {
      setExporting(false);
    }
  };

  const acceptedCount = bulletDecisions.filter((item) => item.state === 'accepted').length
    + (summaryDecision.state === 'accepted' ? 1 : 0)
    + (skillsDecision.state === 'accepted' ? 1 : 0);

  const scoreBefore = detail?.tailored?.original_score ?? detail?.analysis?.overall_score ?? detail?.overall_score ?? 0;
  const scoreAfter = detail?.tailored?.tailored_score ?? scoreBefore;
  const scoreDelta = scoreAfter - scoreBefore;
  const limitReached = usage.limit != null && usage.used >= usage.limit;
  const usageLabel = usage.limit == null ? `${usage.used} this month • unlimited plan` : `${usage.used}/${usage.limit} tailorings used this month`;

  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <div>
          <span className={styles.eyebrow}>Tailoring workflow</span>
          <h2 className={styles.heroTitle}>Review the original resume beside AI suggestions before you commit the changes.</h2>
          <p className={styles.heroText}>
            Keep edits grounded in your real experience, accept only what fits, and save a new tailored version for each role.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Plan</span>
            <strong>{formatPlan(initialData.plan)}</strong>
            <span>{usageLabel}</span>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Resume source</span>
            <strong>{initialData.activeResume?.filename || 'No active resume uploaded'}</strong>
            <span>{initialData.activeResume?.parse_status || 'Upload a parsed resume to start tailoring'}</span>
          </div>
        </div>
      </section>

      <section className={styles.toolbar}>
        <label className={styles.selectField}>
          <span>Choose analyzed application</span>
          <div className={styles.selectWrap}>
            <select value={selectedApplicationId} onChange={(event) => setSelectedApplicationId(event.target.value)}>
              {initialData.applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.job_title} — {application.company}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </label>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleGenerate}
            disabled={generating || loadingDetail || !detail?.analysis_id || !initialData.activeResume || limitReached}
          >
            {generating ? <Loader2 size={16} className={styles.inlineSpin} /> : <Sparkles size={16} />}
            Generate AI suggestions
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleSaveAcceptedChanges}
            disabled={saving || !detail?.tailored || acceptedCount === 0}
          >
            {saving ? <Loader2 size={16} className={styles.inlineSpin} /> : <Save size={16} />}
            Save accepted changes
          </button>
        </div>
      </section>

      {(banner || error) && (
        <div className={banner ? styles.successBanner : styles.errorBanner}>{banner || error}</div>
      )}

      {initialData.applications.length === 0 ? (
        <section className={styles.emptyState}>
          <FileSearch size={28} />
          <h3>No analyzed applications yet</h3>
          <p>Run a job fit analysis first so the tailoring studio has a target role and ATS benchmark to work against.</p>
          <Link href="/analyzer" className={styles.inlineLink}>Open the analyzer</Link>
        </section>
      ) : !initialData.activeResume ? (
        <section className={styles.emptyState}>
          <FileText size={28} />
          <h3>No active resume found</h3>
          <p>Upload and parse your resume before generating tailored suggestions.</p>
          <Link href="/resume" className={styles.inlineLink}>Go to Resume &amp; Evidence</Link>
        </section>
      ) : loadingDetail || !detail ? (
        <section className={styles.loadingState}>
          <Loader2 size={22} className={styles.inlineSpin} />
          <p>Loading tailoring context…</p>
        </section>
      ) : (
        <>
          <section className={styles.scoreGrid}>
            <article className={styles.scoreCard}>
              <span className={styles.scoreLabel}>Before ATS score</span>
              <strong>{scoreBefore}%</strong>
              <p>{detail.job_title} at {detail.company}</p>
            </article>
            <article className={styles.scoreCardAccent}>
              <span className={styles.scoreLabel}>After ATS score</span>
              <strong>{scoreAfter}%</strong>
              <p>{scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} estimated change</p>
            </article>
            <article className={styles.scoreCard}>
              <span className={styles.scoreLabel}>Checks</span>
              <strong>{detail.tailored?.ats_check?.passed ? 'ATS pass' : 'Review needed'}</strong>
              <p>
                {initialData.features.natural_voice_pass
                  ? detail.tailored?.tone_check?.passed ? 'Tone check passed' : 'Tone flagged for review'
                  : 'Natural voice checks unlock on Pro'}
              </p>
            </article>
          </section>

          <section className={styles.splitLayout}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelEyebrow}>Original resume</span>
                  <h3>Source sections</h3>
                </div>
                <span className={styles.panelMeta}>{originalSections.length} sections extracted</span>
              </div>

              <div className={styles.sectionStack}>
                {originalSections.map((section) => (
                  <section key={section.key} className={styles.sectionCard}>
                    <h4>{section.label}</h4>
                    <div className={styles.sectionBody}>
                      {section.body.map((line, index) => (
                        <p key={`${section.key}-${index}`}>{line}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelEyebrow}>AI suggestions</span>
                  <h3>Review and decide</h3>
                </div>
                <span className={styles.panelMeta}>{acceptedCount} accepted</span>
              </div>

              {!detail.tailored ? (
                <div className={styles.emptySuggestionState}>
                  <Sparkles size={24} />
                  <h4>No suggestions generated yet</h4>
                  <p>Generate a tailored draft to compare role-specific edits against your original resume.</p>
                </div>
              ) : (
                <div className={styles.sectionStack}>
                  <section className={styles.suggestionCard}>
                    <div className={styles.suggestionHeader}>
                      <div>
                        <h4>Professional summary</h4>
                        <span className={styles.suggestionMeta}>Version {detail.tailored.version} • {formatDate(detail.tailored.created_at)}</span>
                      </div>
                      <span className={`${styles.stateBadge} ${styles[`state${summaryDecision.state[0].toUpperCase()}${summaryDecision.state.slice(1)}`]}`}>{summaryDecision.state}</span>
                    </div>
                    <textarea
                      className={styles.editor}
                      value={summaryDecision.value}
                      onChange={(event) => setSummaryDecision((current) => ({ ...current, value: event.target.value }))}
                      placeholder="Tailored summary will appear here"
                      rows={4}
                    />
                    <div className={styles.actionRow}>
                      <button type="button" className={styles.acceptButton} onClick={() => setSummaryDecision((current) => ({ ...current, state: 'accepted' }))}>
                        <Check size={15} /> Accept
                      </button>
                      <button type="button" className={styles.rejectButton} onClick={() => setSummaryDecision((current) => ({ ...current, state: 'rejected' }))}>
                        <X size={15} /> Reject
                      </button>
                      <button type="button" className={styles.editButton} onClick={() => setSummaryDecision((current) => ({ ...current, state: 'accepted' }))}>
                        <Pencil size={15} /> Edit
                      </button>
                    </div>
                  </section>

                  {(bulletDecisions.length > 0 ? bulletDecisions : []).map((item, index) => (
                    <section key={`${item.original}-${index}`} className={styles.suggestionCard}>
                      <div className={styles.suggestionHeader}>
                        <div>
                          <h4>Experience bullet {index + 1}</h4>
                          <span className={styles.suggestionMeta}>{item.reason}</span>
                        </div>
                        <span className={`${styles.stateBadge} ${styles[`state${item.state[0].toUpperCase()}${item.state.slice(1)}`]}`}>{item.state}</span>
                      </div>
                      <div className={styles.comparisonGrid}>
                        <div className={styles.comparisonBlock}>
                          <span>Original</span>
                          <p>{item.original}</p>
                        </div>
                        <div className={styles.comparisonBlockAccent}>
                          <span>Suggested</span>
                          <textarea
                            className={styles.editor}
                            value={item.value}
                            onChange={(event) => setBulletDecisions((current) => current.map((bullet, bulletIndex) => bulletIndex === index ? { ...bullet, value: event.target.value } : bullet))}
                            rows={4}
                          />
                        </div>
                      </div>
                      <div className={styles.actionRow}>
                        <button type="button" className={styles.acceptButton} onClick={() => setBulletDecisions((current) => current.map((bullet, bulletIndex) => bulletIndex === index ? { ...bullet, state: 'accepted' } : bullet))}>
                          <Check size={15} /> Accept
                        </button>
                        <button type="button" className={styles.rejectButton} onClick={() => setBulletDecisions((current) => current.map((bullet, bulletIndex) => bulletIndex === index ? { ...bullet, state: 'rejected' } : bullet))}>
                          <X size={15} /> Reject
                        </button>
                        <button type="button" className={styles.editButton} onClick={() => setBulletDecisions((current) => current.map((bullet, bulletIndex) => bulletIndex === index ? { ...bullet, state: 'accepted' } : bullet))}>
                          <Pencil size={15} /> Edit
                        </button>
                      </div>
                    </section>
                  ))}

                  <section className={styles.suggestionCard}>
                    <div className={styles.suggestionHeader}>
                      <div>
                        <h4>Recommended skill order</h4>
                        <span className={styles.suggestionMeta}>Prioritize the strongest ATS matches first</span>
                      </div>
                      <span className={`${styles.stateBadge} ${styles[`state${skillsDecision.state[0].toUpperCase()}${skillsDecision.state.slice(1)}`]}`}>{skillsDecision.state}</span>
                    </div>
                    <textarea
                      className={styles.editor}
                      value={skillsDecision.value.join(', ')}
                      onChange={(event) => setSkillsDecision({
                        value: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                        state: skillsDecision.state,
                      })}
                      rows={3}
                    />
                    <div className={styles.actionRow}>
                      <button type="button" className={styles.acceptButton} onClick={() => setSkillsDecision((current) => ({ ...current, state: 'accepted' }))}>
                        <Check size={15} /> Accept
                      </button>
                      <button type="button" className={styles.rejectButton} onClick={() => setSkillsDecision((current) => ({ ...current, state: 'rejected' }))}>
                        <X size={15} /> Reject
                      </button>
                      <button type="button" className={styles.editButton} onClick={() => setSkillsDecision((current) => ({ ...current, state: 'accepted' }))}>
                        <Pencil size={15} /> Edit
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </article>
          </section>

          <section className={styles.insightGrid}>
            <article className={styles.insightCard}>
              <h4>Matched keywords</h4>
              <div className={styles.tokenWrap}>
                {(detail.tailored?.ats_check?.keywords_matched || detail.analysis?.ats_keywords || []).slice(0, 12).map((keyword) => (
                  <span key={keyword} className={styles.token}>{keyword}</span>
                ))}
              </div>
            </article>
            <article className={styles.insightCard}>
              <h4>ATS issues</h4>
              <ul>
                {(detail.tailored?.ats_check?.issues?.length ? detail.tailored.ats_check.issues : ['No ATS issues were flagged in the latest draft.']).map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </article>
            <article className={styles.insightCard}>
              <h4>Tone review</h4>
              <ul>
                {(detail.tailored?.tone_check?.flags?.length ? detail.tailored.tone_check.flags : ['No tone flags were returned.']).map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className={styles.footerBar}>
            <div>
              <strong>{acceptedCount} accepted changes ready</strong>
              <p>Save accepted edits to create a new tailored resume version, then export the approved draft.</p>
            </div>
            <div className={styles.footerActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => window.location.reload()}>
                <RefreshCw size={16} /> Refresh
              </button>
              <button type="button" className={styles.primaryButton} onClick={handleExportDocx} disabled={exporting || acceptedCount === 0}>
                {exporting ? <Loader2 size={16} className={styles.inlineSpin} /> : <Download size={16} />}
                Export to DOCX
              </button>
            </div>
          </section>

          {initialData.plan === 'free' && usage.limit != null && usage.used >= usage.limit ? (
            <section className={styles.limitNotice}>
              <AlertTriangle size={18} />
              <div>
                <strong>Free tailoring limit reached</strong>
                <p>You have used {usage.used} of {usage.limit} tailorings this month. Pro, Premium, and Lifetime plans unlock unlimited tailoring.</p>
              </div>
              <Link href="/pricing" className={styles.inlineLink}>Upgrade</Link>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
