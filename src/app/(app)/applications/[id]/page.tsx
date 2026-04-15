'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileText,
  Gauge,
  Ghost,
  Loader2,
  MapPin,
  NotebookPen,
  Save,
  ShieldCheck,
  Sparkles,
  Tags,
  TrendingUp,
} from 'lucide-react';
import Topbar from '@/components/app/Topbar';
import {
  buildDownloadFilename,
  buildParagraphDocxBlob,
  buildSimplePdfBlob,
  downloadBlob,
  type ExportSection,
} from '@/lib/client-document-export';
import { createClient } from '@/lib/supabase/client';
import {
  deriveTargetKeywords,
  normalizeMatchedSkills,
  normalizeRecruiterConcerns,
  normalizeScore,
  normalizeScoreBreakdown,
  normalizeSkillGaps,
} from '@/lib/analysis-report';
import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_VALUES,
  normalizeApplicationStatus,
  type ApplicationStatus,
} from '@/lib/application-status';
import { getEffectivePlan, getFeatureAccess, type Plan } from '@/lib/plans';
import styles from './workspace.module.css';

interface ApplicationRecord {
  id: string;
  job_title: string;
  company: string;
  location?: string | null;
  status: ApplicationStatus;
  applied_date: string | null;
  source: string | null;
  notes: string | null;
  overall_score: number | null;
  analysis_id: string | null;
  created_at: string;
}

interface AnalysisRecord {
  overall_score: number | null;
  sub_scores: { skills: number | null; experience: number | null; domain: number | null };
  verdict: 'apply' | 'low-priority' | 'skip';
  matched_skills: { skill: string; evidence_from_resume: string }[];
  skill_gaps: { skill: string; impact: string; suggestion: string }[];
  recruiter_concerns?: { concern: string; severity: string; mitigation: string }[];
  target_keywords: string[];
}

interface TailoredResumeRecord {
  version: number;
  original_score: number;
  tailored_score: number;
  content: {
    tailored_summary?: string;
    tailored_bullets?: { original: string; tailored: string; reason: string }[];
    reordered_skills?: string[];
  } | null;
  ats_check?: { passed?: boolean; issues?: string[]; keywords_matched?: string[]; keywords_missing?: string[] } | null;
  tone_check?: { passed?: boolean; flags?: string[] } | null;
  created_at?: string;
}

interface CoverLetterRecord {
  recommendation: 'skip' | 'short-note' | 'full-letter';
  content: string;
  version: number;
  created_at?: string;
}

type TabKey = 'resume' | 'cover-letter' | 'analysis';

const STATUS_OPTIONS: ApplicationStatus[] = [...APPLICATION_STATUS_VALUES];

const TAB_ITEMS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: 'resume', label: 'Resume strategy', icon: FileText },
  { key: 'cover-letter', label: 'Cover letter', icon: NotebookPen },
  { key: 'analysis', label: 'Analysis signals', icon: Gauge },
];

function formatDate(value?: string | null) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getScoreColor(score: number) {
  if (score >= 70) return 'var(--color-accent-dark)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function getVerdictLabel(verdict?: string, score?: number | null) {
  if (!verdict && score == null) return 'No fit analysis yet';
  if (verdict === 'apply' && (score || 0) >= 85) return 'Strong fit — prioritize this role';
  if (verdict === 'apply') return 'Good fit — worth pursuing';
  if (verdict === 'low-priority') return 'Selective fit — pursue only if strategic';
  return 'Low fit — conserve your time';
}

function getNextStep(app: ApplicationRecord | null, isGhosted: boolean, hasTailored: boolean, hasCoverLetter: boolean) {
  if (!app) return 'Review the role details and decide whether it deserves more effort.';
  if (app.status === 'wishlist' && !hasTailored) return 'Generate a tailored resume before you spend time applying.';
  if (app.status === 'wishlist' && hasTailored && !hasCoverLetter) return 'Use the analysis to decide if a short note or full cover letter is worth it.';
  if (app.status === 'applied' && isGhosted) return 'Send a follow-up note or deprioritize this role and move on.';
  if (app.status === 'applied') return 'Keep momentum by preparing recruiter screen talking points.';
  if (app.status === 'interview') return 'Turn the strongest fit signals into STAR stories and proof points.';
  if (app.status === 'offer') return 'Review compensation, trade-offs, and negotiation points before deciding.';
  if (app.status === 'rejected') return 'Capture learnings, then recycle the best tailored material into the next application.';
  return 'Stay consistent and move the strongest opportunities forward first.';
}

function buildTailoredResumeSections(app: ApplicationRecord, tailored: TailoredResumeRecord): ExportSection[] {
  const sections: ExportSection[] = [
    { heading: 'Target Role', body: `${app.job_title} — ${app.company}` },
    { heading: 'Tailored Summary', body: tailored.content?.tailored_summary || 'No tailored summary available yet.' },
  ];

  if (tailored.content?.tailored_bullets?.length) {
    sections.push({
      heading: 'Tailored Experience Highlights',
      body: tailored.content.tailored_bullets.map((item) => `• ${item.tailored}`).join('\n'),
    });
  }

  if (tailored.content?.reordered_skills?.length) {
    sections.push({
      heading: 'Prioritized Skills',
      body: tailored.content.reordered_skills.join(', '),
    });
  }

  return sections;
}

export default function WorkspacePage() {
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<ApplicationRecord | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [tailored, setTailored] = useState<TailoredResumeRecord | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('resume');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [tailoringLoading, setTailoringLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [bannerMessage, setBannerMessage] = useState('');
  const [error, setError] = useState('');
  const [canDownloadDocs, setCanDownloadDocs] = useState(false);
  const [exportingResume, setExportingResume] = useState(false);
  const [exportingCoverLetter, setExportingCoverLetter] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    const [{ data: appData, error: appError }, authResponse] = await Promise.all([
      supabase
        .from('applications')
        .select('*')
        .eq('id', appId)
        .single(),
      supabase.auth.getUser(),
    ]);

    if (appError || !appData) {
      setApp(null);
      setLoading(false);
      if (appError) setError(appError.message);
      return;
    }

    const userId = authResponse.data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status')
        .eq('id', userId)
        .single();
      const effectivePlan = getEffectivePlan((profile?.plan || 'free') as Plan, profile?.subscription_status);
      setCanDownloadDocs(getFeatureAccess(effectivePlan).docx_download);
    } else {
      setCanDownloadDocs(false);
    }

    const currentApp = {
      ...(appData as ApplicationRecord),
      status: normalizeApplicationStatus(appData.status),
    };
    setApp(currentApp);
    setNotes(currentApp.notes || '');

    const analysisRequest = currentApp.analysis_id
      ? supabase
          .from('job_analyses')
          .select('id, overall_score, skills_score, experience_score, domain_score, verdict, matched_skills, skill_gaps, recruiter_concerns')
          .eq('id', currentApp.analysis_id)
          .single()
      : Promise.resolve({ data: null, error: null });

    const tailoredRequest = supabase
      .from('tailored_resumes')
      .select('version, original_score, tailored_score, content, ats_check, tone_check, created_at')
      .eq('application_id', appId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const coverRequest = supabase
      .from('cover_letters')
      .select('recommendation, content, version, created_at')
      .eq('application_id', appId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const [analysisResponse, tailoredResponse, coverResponse] = await Promise.all([
      analysisRequest,
      tailoredRequest,
      coverRequest,
    ]);

    const analysisData = analysisResponse?.data;

    setAnalysis(
      analysisData
        ? {
            overall_score: normalizeScore(analysisData.overall_score),
            sub_scores: normalizeScoreBreakdown(analysisData as Record<string, unknown>),
            verdict: analysisData.verdict,
            matched_skills: normalizeMatchedSkills(analysisData.matched_skills),
            skill_gaps: normalizeSkillGaps(analysisData.skill_gaps),
            recruiter_concerns: normalizeRecruiterConcerns(analysisData.recruiter_concerns),
            target_keywords: deriveTargetKeywords(
              normalizeMatchedSkills(analysisData.matched_skills),
              normalizeSkillGaps(analysisData.skill_gaps)
            ),
          }
        : null
    );
    setTailored(tailoredResponse?.data || null);
    setCoverLetter(coverResponse?.data || null);
    setLoading(false);
  }, [appId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isGhosted = Boolean(
    app?.status === 'applied' &&
      app.applied_date &&
      (Date.now() - new Date(app.applied_date).getTime()) / (1000 * 60 * 60 * 24) > 14
  );

  const scoreCircumference = 2 * Math.PI * 54;
  const fitScore = analysis?.overall_score ?? normalizeScore(app?.overall_score) ?? 0;
  const nextStep = getNextStep(app, isGhosted, Boolean(tailored), Boolean(coverLetter));

  const keywords = useMemo(() => analysis?.target_keywords || [], [analysis]);

  const matchedKeywordSet = useMemo(() => {
    const matches = new Set<string>();
    analysis?.matched_skills?.forEach((item) => matches.add(item.skill.toLowerCase()));
    tailored?.ats_check?.keywords_matched?.forEach((item) => matches.add(item.toLowerCase()));
    return matches;
  }, [analysis, tailored]);

  const handleSaveNotes = async () => {
    if (!app) return;
    setSavingNotes(true);
    setError('');
    setBannerMessage('');

    const response = await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: app.id, notes }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to save notes.');
    } else {
      setApp({ ...(payload.data as ApplicationRecord), status: normalizeApplicationStatus(payload.data.status) });
      setBannerMessage('Notes saved.');
    }

    setSavingNotes(false);
  };

  const handleStatusChange = async (status: ApplicationRecord['status']) => {
    if (!app) return;
    setStatusUpdating(true);
    setError('');
    setBannerMessage('');

    const response = await fetch(`/api/applications/${app.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to update status.');
    } else {
      setApp({ ...(payload.data as ApplicationRecord), status: normalizeApplicationStatus(payload.data.status) });
      setBannerMessage(`Status updated to ${APPLICATION_STATUS_META[status].label}.`);
    }

    setStatusUpdating(false);
  };

  const handleGenerateTailored = async () => {
    if (!app?.analysis_id) {
      setError('Analyze the role first before generating a tailored resume.');
      return;
    }

    setTailoringLoading(true);
    setError('');
    setBannerMessage('');

    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: app.id, analysis_id: app.analysis_id }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to generate tailored resume.');
      setTailoringLoading(false);
      return;
    }

    setBannerMessage('Tailored resume generated.');
    await fetchData();
    setActiveTab('resume');
    setTailoringLoading(false);
  };

  const handleGenerateCoverLetter = async () => {
    if (!app?.analysis_id) {
      setError('Analyze the role first before generating a cover letter.');
      return;
    }

    setCoverLoading(true);
    setError('');
    setBannerMessage('');

    const response = await fetch('/api/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: app.id, analysis_id: app.analysis_id }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error || 'Unable to generate cover letter.');
      setCoverLoading(false);
      return;
    }

    setBannerMessage('Cover letter recommendation generated.');
    await fetchData();
    setActiveTab('cover-letter');
    setCoverLoading(false);
  };

  const handleCopy = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      setError('Unable to copy to clipboard on this device.');
    }
  };

  const handleDownloadTailoredDocx = async () => {
    if (!app || !tailored || !canDownloadDocs) return;
    setExportingResume(true);
    setError('');
    setBannerMessage('');

    try {
      const blob = await buildParagraphDocxBlob(buildTailoredResumeSections(app, tailored));
      downloadBlob(buildDownloadFilename([app.company, app.job_title], 'tailored-resume', 'docx'), blob);
      setBannerMessage('Tailored resume DOCX downloaded.');
    } catch {
      setError('Unable to download the tailored resume DOCX on this device.');
    } finally {
      setExportingResume(false);
    }
  };

  const handleDownloadTailoredPdf = async () => {
    if (!app || !tailored || !canDownloadDocs) return;
    setExportingResume(true);
    setError('');
    setBannerMessage('');

    try {
      const blob = await buildSimplePdfBlob(`${app.job_title} — ${app.company}`, buildTailoredResumeSections(app, tailored));
      downloadBlob(buildDownloadFilename([app.company, app.job_title], 'tailored-resume', 'pdf'), blob);
      setBannerMessage('Tailored resume PDF downloaded.');
    } catch {
      setError('Unable to download the tailored resume PDF on this device.');
    } finally {
      setExportingResume(false);
    }
  };

  const handleDownloadCoverLetterTxt = async () => {
    if (!app || !coverLetter || !coverLetter.content || !canDownloadDocs) return;
    setExportingCoverLetter(true);
    setError('');
    setBannerMessage('');

    try {
      downloadBlob(
        buildDownloadFilename([app.job_title, app.company], 'cover-letter', 'txt'),
        new Blob([coverLetter.content], { type: 'text/plain;charset=utf-8' })
      );
      setBannerMessage('Cover letter TXT downloaded.');
    } catch {
      setError('Unable to download the cover letter TXT on this device.');
    } finally {
      setExportingCoverLetter(false);
    }
  };

  const handleDownloadCoverLetterDocx = async () => {
    if (!app || !coverLetter || !coverLetter.content || !canDownloadDocs) return;
    setExportingCoverLetter(true);
    setError('');
    setBannerMessage('');

    try {
      const blob = await buildParagraphDocxBlob([
        { heading: 'Cover Letter', body: coverLetter.content },
      ]);
      downloadBlob(buildDownloadFilename([app.job_title, app.company], 'cover-letter', 'docx'), blob);
      setBannerMessage('Cover letter DOCX downloaded.');
    } catch {
      setError('Unable to download the cover letter DOCX on this device.');
    } finally {
      setExportingCoverLetter(false);
    }
  };

  const handleDownloadCoverLetterPdf = async () => {
    if (!app || !coverLetter || !coverLetter.content || !canDownloadDocs) return;
    setExportingCoverLetter(true);
    setError('');
    setBannerMessage('');

    try {
      const blob = await buildSimplePdfBlob(`${app.job_title} — ${app.company}`, [
        { heading: 'Cover Letter', body: coverLetter.content },
      ]);
      downloadBlob(buildDownloadFilename([app.job_title, app.company], 'cover-letter', 'pdf'), blob);
      setBannerMessage('Cover letter PDF downloaded.');
    } catch {
      setError('Unable to download the cover letter PDF on this device.');
    } finally {
      setExportingCoverLetter(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="Application Workspace" breadcrumb="Workspace / Application Workspace" />
        <div className={styles.page}>
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={24} />
            <p>Loading the application workspace…</p>
          </div>
        </div>
      </>
    );
  }

  if (!app) {
    return (
      <>
        <Topbar title="Application Workspace" breadcrumb="Workspace / Application Workspace" />
        <div className={styles.page}>
          <div className={styles.emptyState}>
            <h3>Application not found</h3>
            <p>{error || 'This role may have been deleted or moved.'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Application Workspace" breadcrumb="Workspace / Application Workspace" />
      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroMain}>
            <div className={styles.eyebrow}>Opportunity workspace</div>
            <h1 className={styles.heroTitle}>{app.job_title}</h1>
            <div className={styles.heroMetaRow}>
              <span className={styles.metaPill}><BriefcaseBusiness size={14} /> {app.company}</span>
              {app.location ? <span className={styles.metaPill}><MapPin size={14} /> {app.location}</span> : null}
              <span className={`${styles.statusBadge} ${styles[`status${app.status[0].toUpperCase()}${app.status.slice(1)}`]}`}>{app.status}</span>
            </div>
            <p className={styles.heroSummary}>{getVerdictLabel(analysis?.verdict, analysis?.overall_score ?? app.overall_score)}</p>
          </div>

          <div className={styles.heroActions}>
            {app.analysis_id ? (
              <Link href={`/analyses/${app.analysis_id}`} className={styles.secondaryButton}>
                <Gauge size={16} /> Full report
              </Link>
            ) : null}
            <button type="button" className={styles.primaryButton} onClick={handleGenerateTailored} disabled={tailoringLoading || !app.analysis_id}>
              {tailoringLoading ? <Loader2 size={16} className={styles.inlineSpin} /> : <Sparkles size={16} />} Tailor resume
            </button>
            <button type="button" className={styles.secondaryButton} onClick={handleGenerateCoverLetter} disabled={coverLoading || !app.analysis_id}>
              {coverLoading ? <Loader2 size={16} className={styles.inlineSpin} /> : <FileText size={16} />} Generate cover letter
            </button>
          </div>
        </section>

        {(bannerMessage || error) && (
          <div className={bannerMessage ? styles.successBanner : styles.errorBanner}>{bannerMessage || error}</div>
        )}

        <section className={styles.summaryGrid}>
          <article className={styles.scoreCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Fit snapshot</span>
              <Gauge size={18} />
            </div>
            <div className={styles.scoreRingWrap}>
              <svg className={styles.scoreRingSvg} viewBox="0 0 132 132" aria-hidden="true">
                <circle className={styles.scoreRingTrack} cx="66" cy="66" r="54" />
                <circle
                  className={styles.scoreRingFill}
                  cx="66"
                  cy="66"
                  r="54"
                  stroke={getScoreColor(fitScore)}
                  strokeDasharray={scoreCircumference}
                  strokeDashoffset={scoreCircumference * (1 - fitScore / 100)}
                />
              </svg>
              <div className={styles.scoreRingCenter}>
                <strong>{analysis ? `${fitScore}%` : '--'}</strong>
                <span>{analysis?.verdict ? analysis.verdict.replace('-', ' ') : 'No verdict'}</span>
              </div>
            </div>
            <div className={styles.metricStack}>
              <div className={styles.metricRow}><span>Skills</span><strong>{analysis?.sub_scores?.skills ?? '--'}%</strong></div>
              <div className={styles.metricRow}><span>Experience</span><strong>{analysis?.sub_scores?.experience ?? '--'}%</strong></div>
              <div className={styles.metricRow}><span>Domain</span><strong>{analysis?.sub_scores?.domain ?? '--'}%</strong></div>
            </div>
          </article>

          <article className={styles.actionCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Next best move</span>
              <ChevronRight size={18} />
            </div>
            <h3 className={styles.actionTitle}>{nextStep}</h3>
            <div className={styles.actionMeta}>
              <span className={styles.metaBlock}><strong>Applied</strong><span>{formatDate(app.applied_date)}</span></span>
              <span className={styles.metaBlock}><strong>Source</strong><span>{app.source || 'Not set'}</span></span>
              <span className={styles.metaBlock}><strong>Updated</strong><span>{formatDate(app.created_at)}</span></span>
            </div>
            {isGhosted ? <div className={styles.warningCallout}><Ghost size={16} /> This application looks ghosted after 14+ days.</div> : null}
          </article>

          <article className={styles.actionCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>Pipeline control</span>
              <TrendingUp size={18} />
            </div>
            <div className={styles.statusGrid}>
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`${styles.statusOption} ${app.status === status ? styles.statusOptionActive : ''}`}
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange(status)}
                >
                  {APPLICATION_STATUS_META[status].label}
                </button>
              ))}
            </div>
            <p className={styles.supportText}>{statusUpdating ? 'Updating status…' : 'Move the role forward as the process changes.'}</p>
          </article>
        </section>

        <div className={styles.workspaceGrid}>
          <section className={styles.mainPanel}>
            <div className={styles.tabList}>
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.tabPanel}>
              {activeTab === 'resume' && (
                tailored ? (
                  <div className={styles.panelStack}>
                    <div className={styles.dualMetricRow}>
                      <div className={styles.miniMetricCard}>
                        <span>Original score</span>
                        <strong style={{ color: getScoreColor(tailored.original_score) }}>{tailored.original_score}%</strong>
                      </div>
                      <div className={styles.miniMetricCard}>
                        <span>Tailored score</span>
                        <strong style={{ color: getScoreColor(tailored.tailored_score) }}>{tailored.tailored_score}%</strong>
                      </div>
                      <div className={styles.miniMetricCard}>
                        <span>Version</span>
                        <strong>v{tailored.version}</strong>
                      </div>
                    </div>

                    <article className={styles.detailCard}>
                      <div className={styles.detailHeader}>
                        <h3>Tailored summary</h3>
                        <div className={styles.actionRow}>
                          {canDownloadDocs ? (
                            <>
                              <button type="button" className={styles.copyButton} onClick={handleDownloadTailoredDocx} disabled={exportingResume}>
                                <FileText size={14} /> Download tailored DOCX
                              </button>
                              <button type="button" className={styles.copyButton} onClick={handleDownloadTailoredPdf} disabled={exportingResume}>
                                <FileText size={14} /> Download tailored PDF
                              </button>
                            </>
                          ) : null}
                          <button type="button" className={styles.copyButton} onClick={() => handleCopy(tailored.content?.tailored_summary || '', 'summary')}>
                            <Copy size={14} /> {copied === 'summary' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <p>{tailored.content?.tailored_summary || 'No tailored summary available yet.'}</p>
                    </article>

                    <article className={styles.detailCard}>
                      <div className={styles.detailHeader}>
                        <h3>Rewritten bullets</h3>
                      </div>
                      <div className={styles.rewriteList}>
                        {tailored.content?.tailored_bullets?.length ? tailored.content.tailored_bullets.map((item, index) => (
                          <div key={`${item.tailored}-${index}`} className={styles.rewriteItem}>
                            <div>
                              <span className={styles.rewriteLabel}>Original</span>
                              <p>{item.original}</p>
                            </div>
                            <div>
                              <span className={styles.rewriteLabel}>Tailored</span>
                              <p>{item.tailored}</p>
                            </div>
                            <div>
                              <span className={styles.rewriteLabel}>Why this change matters</span>
                              <p>{item.reason}</p>
                            </div>
                          </div>
                        )) : <p className={styles.emptyText}>No rewritten bullets are available yet.</p>}
                      </div>
                    </article>

                    <article className={styles.detailCard}>
                      <div className={styles.detailHeader}>
                        <h3>Skills to front-load</h3>
                      </div>
                      <div className={styles.keywordList}>
                        {tailored.content?.reordered_skills?.length ? tailored.content.reordered_skills.map((skill) => (
                          <span key={skill} className={styles.skillChip}>{skill}</span>
                        )) : <p className={styles.emptyText}>No reordered skills returned.</p>}
                      </div>
                    </article>
                  </div>
                ) : (
                  <div className={styles.emptyPanel}>
                    <Sparkles size={28} />
                    <h3>No tailored resume yet</h3>
                    <p>Generate one when the role is strong enough to justify tailoring effort.</p>
                    <button type="button" className={styles.primaryButton} onClick={handleGenerateTailored} disabled={tailoringLoading || !app.analysis_id}>
                      {tailoringLoading ? <Loader2 size={16} className={styles.inlineSpin} /> : <Sparkles size={16} />} Tailor resume
                    </button>
                  </div>
                )
              )}

              {activeTab === 'cover-letter' && (
                coverLetter ? (
                  <div className={styles.panelStack}>
                    <div className={styles.dualMetricRow}>
                      <div className={styles.miniMetricCard}>
                        <span>Recommendation</span>
                        <strong>{coverLetter.recommendation.replace('-', ' ')}</strong>
                      </div>
                      <div className={styles.miniMetricCard}>
                        <span>Version</span>
                        <strong>v{coverLetter.version}</strong>
                      </div>
                      <div className={styles.miniMetricCard}>
                        <span>Generated</span>
                        <strong>{formatDate(coverLetter.created_at)}</strong>
                      </div>
                    </div>

                    <article className={styles.detailCard}>
                      <div className={styles.detailHeader}>
                        <h3>Draft</h3>
                        <div className={styles.actionRow}>
                          {canDownloadDocs && coverLetter.content ? (
                            <>
                              <button type="button" className={styles.copyButton} onClick={handleDownloadCoverLetterTxt} disabled={exportingCoverLetter}>
                                <FileText size={14} /> Download cover letter TXT
                              </button>
                              <button type="button" className={styles.copyButton} onClick={handleDownloadCoverLetterDocx} disabled={exportingCoverLetter}>
                                <FileText size={14} /> Download cover letter DOCX
                              </button>
                              <button type="button" className={styles.copyButton} onClick={handleDownloadCoverLetterPdf} disabled={exportingCoverLetter}>
                                <FileText size={14} /> Download cover letter PDF
                              </button>
                            </>
                          ) : null}
                          <button type="button" className={styles.copyButton} onClick={() => handleCopy(coverLetter.content, 'cover-letter')}>
                            <Copy size={14} /> {copied === 'cover-letter' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className={styles.coverLetterText}>{coverLetter.content || 'This role likely does not need a cover letter.'}</div>
                    </article>
                  </div>
                ) : (
                  <div className={styles.emptyPanel}>
                    <FileText size={28} />
                    <h3>No cover letter recommendation yet</h3>
                    <p>Generate a recommendation when you want help deciding between skip, short note, or full letter.</p>
                    <button type="button" className={styles.primaryButton} onClick={handleGenerateCoverLetter} disabled={coverLoading || !app.analysis_id}>
                      {coverLoading ? <Loader2 size={16} className={styles.inlineSpin} /> : <FileText size={16} />} Generate cover letter
                    </button>
                  </div>
                )
              )}

              {activeTab === 'analysis' && (
                analysis ? (
                  <div className={styles.panelStack}>
                    <article className={styles.detailCard}>
                      <div className={styles.detailHeader}>
                        <h3>Matched signals</h3>
                      </div>
                      <div className={styles.signalList}>
                        {analysis.matched_skills?.length ? analysis.matched_skills.map((item, index) => (
                          <div key={`${item.skill}-${index}`} className={styles.signalItem}>
                            <span className={styles.signalPillPositive}>Matched</span>
                            <div>
                              <strong>{item.skill}</strong>
                              <p>{item.evidence_from_resume}</p>
                            </div>
                          </div>
                        )) : <p className={styles.emptyText}>No matched strengths available.</p>}
                      </div>
                    </article>

                    <article className={styles.detailCard}>
                      <div className={styles.detailHeader}>
                        <h3>Skill gaps</h3>
                      </div>
                      <div className={styles.signalList}>
                        {analysis.skill_gaps?.length ? analysis.skill_gaps.map((item, index) => (
                          <div key={`${item.skill}-${index}`} className={styles.signalItem}>
                            <span className={styles.signalPillWarning}>{item.impact} impact</span>
                            <div>
                              <strong>{item.skill}</strong>
                              <p>{item.suggestion}</p>
                            </div>
                          </div>
                        )) : <p className={styles.emptyText}>No material skill gaps detected.</p>}
                      </div>
                    </article>
                  </div>
                ) : (
                  <div className={styles.emptyPanel}>
                    <ShieldCheck size={28} />
                    <h3>No analysis linked</h3>
                    <p>This application was likely added manually. Run it through the analyzer to unlock fit intelligence.</p>
                  </div>
                )
              )}
            </div>
          </section>

          <aside className={styles.sidePanel}>
            <article className={styles.sideCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Notes</span>
                <NotebookPen size={18} />
              </div>
              <textarea
                className={styles.notesTextarea}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Capture recruiter names, outreach steps, interview prep notes, or anything worth remembering."
              />
              <button type="button" className={styles.secondaryButton} onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? <Loader2 size={16} className={styles.inlineSpin} /> : <Save size={16} />} Save notes
              </button>
            </article>

            <article className={styles.sideCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>ATS keywords</span>
                <Tags size={18} />
              </div>
              <div className={styles.keywordList}>
                {keywords.length ? keywords.map((keyword) => {
                  const matched = Array.from(matchedKeywordSet).some((value) => value.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(value));
                  return (
                    <span key={keyword} className={`${styles.keywordChip} ${matched ? styles.keywordChipMatched : ''}`}>
                      {keyword}
                    </span>
                  );
                }) : <p className={styles.emptyText}>No ATS keywords available for this role yet.</p>}
              </div>
            </article>

            <article className={styles.sideCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Quality checks</span>
                <ShieldCheck size={18} />
              </div>
              <div className={styles.checkStack}>
                <div className={styles.checkRow}>
                  <span>ATS readiness</span>
                  <strong className={tailored?.ats_check?.passed ? styles.passText : styles.warnText}>
                    {tailored ? (tailored.ats_check?.passed ? 'Passed' : 'Needs review') : 'Not run'}
                  </strong>
                </div>
                {tailored?.ats_check?.issues?.length ? tailored.ats_check.issues.map((issue) => (
                  <div key={issue} className={styles.calloutWarning}><AlertTriangle size={14} /> {issue}</div>
                )) : null}

                <div className={styles.checkRow}>
                  <span>Tone quality</span>
                  <strong className={tailored?.tone_check?.passed ? styles.passText : styles.warnText}>
                    {tailored ? (tailored.tone_check?.passed ? 'Natural' : 'Review tone') : 'Not run'}
                  </strong>
                </div>
                {tailored?.tone_check?.flags?.length ? tailored.tone_check.flags.map((flag) => (
                  <div key={flag} className={styles.calloutWarning}><AlertTriangle size={14} /> {flag}</div>
                )) : null}
              </div>
            </article>

            <article className={styles.sideCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Role health</span>
                <CheckCircle2 size={18} />
              </div>
              <div className={styles.checkStack}>
                <div className={styles.checkRow}><span>Matched skills</span><strong>{analysis?.matched_skills?.length ?? 0}</strong></div>
                <div className={styles.checkRow}><span>Skill gaps</span><strong>{analysis?.skill_gaps?.length ?? 0}</strong></div>
                <div className={styles.checkRow}><span>Tailored resume</span><strong>{tailored ? 'Ready' : 'Missing'}</strong></div>
                <div className={styles.checkRow}><span>Cover letter</span><strong>{coverLetter ? 'Ready' : 'Missing'}</strong></div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </>
  );
}
