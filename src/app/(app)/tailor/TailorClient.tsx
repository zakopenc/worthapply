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
import { createClient } from '@/lib/supabase/client';
import {
  buildDownloadFilename,
  buildResumeDocxBlob,
  buildResumePdfBlob,
  buildAnnotatedResumeDocxBlob,
  type ResumeDocumentModel,
  type ResumeExperienceEntry,
  type ResumeSkillGroup,
  downloadBlob,
} from '@/lib/client-document-export';
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

interface TailoredBulletApi {
  original: string;
  tailored: string;
  reason: string;
  framework?: 'PAR' | 'CAR';
  needs_metric?: boolean;
  metric_question?: string;
}

interface RedFlagItem {
  type: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  action: string;
}

interface TailoredContent {
  tailored_summary?: string;
  tailored_bullets?: TailoredBulletApi[];
  reordered_skills?: string[];
  length_guidance?: { recommended_pages: 1 | 2; reason: string };
  seniority_match?: { candidate_level: string; target_level: string; gap_note: string };
  red_flags?: RedFlagItem[];
  ats_family?: string;
  portfolio_suggestion?: { needed: boolean; reason: string; suggestion: string };
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
  plan: 'free' | 'pro' | 'premium';
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
  framework?: 'PAR' | 'CAR';
  needs_metric?: boolean;
  metric_question?: string;
};

function formatPlan(plan: TailorInitialData['plan']) {
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

interface ParsedResumeWithContact extends ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  headline?: string;
  location?: string;
  links?: string[];
  certifications?: string[] | { name?: string; issuer?: string; year?: string }[];
}

function extractContacts(resume: ParsedResumeWithContact | null, fallbackName: string): ResumeDocumentModel['header'] {
  const name = (resume?.name && String(resume.name).trim()) || fallbackName || 'Your Name';
  const contacts: string[] = [];
  if (resume?.email) contacts.push(String(resume.email));
  if (resume?.phone) contacts.push(String(resume.phone));
  if (resume?.location) contacts.push(String(resume.location));
  if (Array.isArray(resume?.links)) resume.links.forEach((l) => l && contacts.push(String(l)));
  return {
    name,
    headline: resume?.headline ? String(resume.headline) : undefined,
    contacts,
  };
}

function buildTailoredResumeDocument(
  resume: ParsedResumeWithContact | null,
  fallbackName: string,
  summaryDecision: { value: string; state: SuggestionState },
  bulletDecisions: BulletDecision[],
  skillsDecision: { value: string[]; state: SuggestionState }
): ResumeDocumentModel {
  const header = extractContacts(resume, fallbackName);

  const acceptedBullets = bulletDecisions.filter((d) => d.state === 'accepted' && d.value.trim());
  const originalToAccepted = new Map<string, BulletDecision>();
  acceptedBullets.forEach((d) => originalToAccepted.set(d.original.trim(), d));

  const summary =
    summaryDecision.state === 'accepted' && summaryDecision.value.trim()
      ? summaryDecision.value.trim()
      : resume?.summary?.trim() || undefined;

  const experience: ResumeExperienceEntry[] = (resume?.work_history || []).map((job) => {
    const originalBullets = Array.isArray(job.highlights) && job.highlights.length > 0
      ? job.highlights
      : typeof (job as unknown as { summary?: string }).summary === 'string'
        ? ((job as unknown as { summary: string }).summary.split(/\n+/).filter(Boolean))
        : [];
    const mergedBullets: string[] = [];
    const mergedAnnotations: (NonNullable<ResumeExperienceEntry['bulletAnnotations']>[number])[] = [];
    originalBullets.forEach((b) => {
      const decision = originalToAccepted.get(b.trim());
      if (decision) {
        mergedBullets.push(decision.value.trim());
        mergedAnnotations.push({ framework: decision.framework, reason: decision.reason });
      } else {
        mergedBullets.push(b);
        mergedAnnotations.push(undefined);
      }
    });
    acceptedBullets
      .filter((d) => !originalBullets.some((b) => b.trim() === d.original.trim()))
      .forEach((d) => {
        mergedBullets.push(d.value.trim());
        mergedAnnotations.push({ framework: d.framework, reason: d.reason });
      });
    return {
      title: job.title || '',
      company: job.company || '',
      dates: [job.start || job.start_date, job.end || job.end_date].filter(Boolean).join(' – '),
      bullets: mergedBullets,
      bulletAnnotations: mergedAnnotations,
    };
  });

  // If any accepted bullets don't match any work_history bullet AND there's no work_history, surface them as a Highlights section
  if (experience.length === 0 && acceptedBullets.length > 0) {
    experience.push({
      title: 'Selected Highlights',
      company: '',
      bullets: acceptedBullets.map((d) => d.value.trim()),
      bulletAnnotations: acceptedBullets.map((d) => ({ framework: d.framework, reason: d.reason })),
    });
  }

  const skillsFromResume = normalizeSkills(resume?.skills);
  const skills: ResumeSkillGroup[] = (() => {
    if (skillsDecision.state === 'accepted' && skillsDecision.value.length > 0) {
      return [{ category: 'Core skills', items: skillsDecision.value }];
    }
    if (skillsFromResume.length > 0) return skillsFromResume;
    return [];
  })();

  const education = (resume?.education || []).map((ed) => ({
    degree: [ed.degree, ed.field].filter(Boolean).join(', '),
    school: ed.institution || '',
    dates: ed.year || '',
  }));

  const certifications = Array.isArray(resume?.certifications)
    ? resume!.certifications!
        .map((c) => (typeof c === 'string' ? c : [c.name, c.issuer, c.year].filter(Boolean).join(' — ')))
        .filter(Boolean)
    : undefined;

  const leadership = (resume?.leadership || resume?.leadership_stories || [])
    .map((item) => (typeof item === 'string' ? item : item.text || item.title || item.story || ''))
    .filter(Boolean) as string[];

  return {
    header,
    summary,
    experience,
    skills,
    education,
    certifications,
    leadership,
  };
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
        framework: item.framework,
        needs_metric: item.needs_metric,
        metric_question: item.metric_question,
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
          framework: item.framework,
          needs_metric: item.needs_metric,
          metric_question: item.metric_question,
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
      setError('DOCX export is available on Pro and Premium plans.');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const resumeDoc = buildTailoredResumeDocument(
        parsedResume as ParsedResumeWithContact | null,
        initialData.userName,
        summaryDecision,
        bulletDecisions,
        skillsDecision
      );
      const blob = await buildResumeDocxBlob(resumeDoc);
      downloadBlob(buildDownloadFilename([resumeDoc.header.name, detail.job_title, detail.company], 'resume', 'docx'), blob);
      setBanner('Tailored resume downloaded as DOCX.');
    } catch {
      setError('Unable to export the DOCX file on this device.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!detail) return;
    if (!initialData.features.docx_download) {
      setError('PDF export is available on Pro and Premium plans.');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const resumeDoc = buildTailoredResumeDocument(
        parsedResume as ParsedResumeWithContact | null,
        initialData.userName,
        summaryDecision,
        bulletDecisions,
        skillsDecision
      );
      const blob = await buildResumePdfBlob(resumeDoc);
      downloadBlob(buildDownloadFilename([resumeDoc.header.name, detail.job_title, detail.company], 'resume', 'pdf'), blob);
      setBanner('Tailored resume downloaded as PDF.');
    } catch {
      setError('Unable to export the PDF file on this device.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAnnotated = async () => {
    if (!detail) return;
    if (!initialData.features.docx_download) {
      setError('Annotated export is available on Pro and Premium plans.');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const resumeDoc = buildTailoredResumeDocument(
        parsedResume as ParsedResumeWithContact | null,
        initialData.userName,
        summaryDecision,
        bulletDecisions,
        skillsDecision
      );
      const blob = await buildAnnotatedResumeDocxBlob(resumeDoc);
      downloadBlob(buildDownloadFilename([resumeDoc.header.name, detail.job_title, detail.company], 'resume-annotated', 'docx'), blob);
      setBanner('Annotated copy downloaded. For your reference only — do not send to recruiters.');
    } catch {
      setError('Unable to export the annotated file on this device.');
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
      <header className={styles.pageHeader}>
        <div className={styles.pageTitleRow}>
          <div>
            <h1 className={styles.pageTitle}>Resume Tailoring</h1>
            <p className={styles.pageDesc}>Review AI suggestions side-by-side with your original resume. Accept, edit, or reject each change before saving.</p>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{formatPlan(initialData.plan)}</span>
            <span className={styles.metaPill}>{usageLabel}</span>
          </div>
        </div>
      </header>

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
            Generate suggestions
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

          {detail.tailored?.content && (() => {
            const c = detail.tailored.content as TailoredContent;
            const hasRedFlags = Array.isArray(c.red_flags) && c.red_flags.length > 0;
            const hasLength = !!c.length_guidance;
            const hasSeniority = !!c.seniority_match;
            const hasAtsFamily = !!c.ats_family && c.ats_family !== 'unknown';
            const hasPortfolio = !!c.portfolio_suggestion?.needed;
            if (!hasRedFlags && !hasLength && !hasSeniority && !hasAtsFamily && !hasPortfolio) return null;
            return (
              <section style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginBottom: 18 }}>
                {hasRedFlags && (
                  <article style={{ padding: 18, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14 }}>
                    <strong style={{ display: 'block', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: '#9a3412', marginBottom: 10 }}>Pre-flight review · {c.red_flags!.length} finding{c.red_flags!.length === 1 ? '' : 's'}</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                      {c.red_flags!.map((flag) => (
                        <li key={flag.type} style={{ fontSize: 13, lineHeight: 1.55, color: '#431407' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', background: flag.severity === 'high' ? '#dc2626' : flag.severity === 'medium' ? '#f59e0b' : '#64748b', color: 'white', marginRight: 8 }}>{flag.severity}</span>
                          <strong>{flag.explanation}</strong>
                          <div style={{ marginTop: 4, color: '#7c2d12' }}>Action: {flag.action}</div>
                        </li>
                      ))}
                    </ul>
                  </article>
                )}
                {hasLength && (
                  <article style={{ padding: 18, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 14 }}>
                    <strong style={{ display: 'block', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>Recommended length</strong>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{c.length_guidance!.recommended_pages} page{c.length_guidance!.recommended_pages > 1 ? 's' : ''}</div>
                    <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0' }}>{c.length_guidance!.reason}</p>
                  </article>
                )}
                {hasSeniority && (
                  <article style={{ padding: 18, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 14 }}>
                    <strong style={{ display: 'block', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: '#4338ca', marginBottom: 10 }}>Seniority fit</strong>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#312e81', textTransform: 'capitalize' }}>{c.seniority_match!.candidate_level} → {c.seniority_match!.target_level}</div>
                    <p style={{ fontSize: 13, color: '#4338ca', margin: '6px 0 0' }}>{c.seniority_match!.gap_note}</p>
                  </article>
                )}
                {hasAtsFamily && (
                  <article style={{ padding: 18, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 14 }}>
                    <strong style={{ display: 'block', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: '#047857', marginBottom: 10 }}>Detected ATS</strong>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#064e3b', textTransform: 'capitalize' }}>{c.ats_family}</div>
                    <p style={{ fontSize: 13, color: '#047857', margin: '6px 0 0' }}>Keyword placement tuned for this ATS family.</p>
                  </article>
                )}
                {hasPortfolio && (
                  <article style={{ padding: 18, background: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: 14, gridColumn: 'span 2' }}>
                    <strong style={{ display: 'block', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', color: '#6b21a8', marginBottom: 10 }}>Portfolio opportunity</strong>
                    <p style={{ fontSize: 14, color: '#581c87', margin: '0 0 8px', fontWeight: 600 }}>{c.portfolio_suggestion!.reason}</p>
                    <p style={{ fontSize: 13, color: '#6b21a8', margin: 0 }}>{c.portfolio_suggestion!.suggestion}</p>
                  </article>
                )}
              </section>
            );
          })()}

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
                          <h4>
                            Experience bullet {index + 1}
                            {item.framework && (
                              <span style={{ marginLeft: 10, padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 0.5, background: item.framework === 'PAR' ? '#1e293b' : '#4338ca', color: 'white', verticalAlign: 'middle' }}>{item.framework}</span>
                            )}
                          </h4>
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
                      {item.needs_metric && item.metric_question && (
                        <div style={{ marginTop: 12, padding: '12px 14px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ flexShrink: 0, marginTop: 2, width: 22, height: 22, borderRadius: 999, background: '#d97706', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</span>
                          <div style={{ fontSize: 13, color: '#78350f' }}>
                            <strong style={{ display: 'block', marginBottom: 2 }}>Add a metric to make this land</strong>
                            <span>{item.metric_question}</span>
                            <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: '#92400e' }}>Edit the suggested bullet above to add the number — we won&apos;t invent it for you.</span>
                          </div>
                        </div>
                      )}
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
              <button type="button" className={styles.secondaryButton} onClick={handleExportPdf} disabled={exporting || !parsedResume}>
                {exporting ? <Loader2 size={16} className={styles.inlineSpin} /> : <Download size={16} />}
                Export to PDF
              </button>
              <button type="button" className={styles.primaryButton} onClick={handleExportDocx} disabled={exporting || !parsedResume}>
                {exporting ? <Loader2 size={16} className={styles.inlineSpin} /> : <Download size={16} />}
                Export to DOCX
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleExportAnnotated}
                disabled={exporting || !parsedResume || bulletDecisions.filter((b) => b.state === 'accepted').length === 0}
                title="Includes framework + reasoning notes under each tailored bullet. For your study only — do not send to recruiters."
              >
                {exporting ? <Loader2 size={16} className={styles.inlineSpin} /> : <Download size={16} />}
                Export annotated
              </button>
            </div>
          </section>

          {initialData.plan === 'free' && usage.limit != null && usage.used >= usage.limit ? (
            <section className={styles.limitNotice}>
              <AlertTriangle size={18} />
              <div>
                <strong>Free tailoring limit reached</strong>
                <p>You have used {usage.used} of {usage.limit} tailorings this month. Pro and Premium plans unlock unlimited tailoring.</p>
              </div>
              <Link href="/pricing" className={styles.inlineLink}>Upgrade</Link>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
