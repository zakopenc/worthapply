'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload, Download, Trash2, FileText, Award, Wrench,
  Briefcase, GraduationCap, Users, Clock, CheckCircle2,
  AlertCircle, Loader2,
} from 'lucide-react';
import styles from './resume.module.css';

interface Resume {
  id: string;
  filename: string;
  uploaded_at: string;
  parse_status: 'pending' | 'processing' | 'complete' | 'failed';
  file_url: string;
}

interface AchievementItem {
  text: string;
  metrics?: string[] | string;
  tags?: string[];
}

interface SkillCategory {
  category?: string;
  items?: string[];
}

interface WorkHistoryItem {
  company: string;
  title: string;
  start_date?: string;
  end_date?: string;
  start?: string;
  end?: string;
  highlights?: string[];
}

interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  year?: string;
}

interface LeadershipItem {
  title?: string;
  story?: string;
  text?: string;
}

interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

interface ParsedWorkItem {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}

interface ParsedEducationItem {
  institution: string;
  degree: string;
  details: string;
}

interface ParsedData {
  achievements?: AchievementItem[];
  skills?: SkillCategory[] | string[] | { technical?: string[]; product?: string[]; leadership?: string[]; domain?: string[]; soft?: string[]; [key: string]: unknown };
  tools?: { name?: string; proficiency?: string }[];
  work_history?: WorkHistoryItem[];
  work_experience?: WorkHistoryItem[];
  experience?: WorkHistoryItem[];
  education?: EducationItem[];
  education_history?: EducationItem[];
  leadership?: LeadershipItem[];
  leadership_stories?: LeadershipItem[];
  contact_info?: ContactInfo;
  contact?: ContactInfo;
  basics?: ContactInfo;
  personal_info?: ContactInfo;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  portfolio?: string;
  [key: string]: unknown;
}

interface ResumeClientProps {
  initialResume: Resume | null;
  initialParsedData: ParsedData | null;
  itemsExtracted: number;
}

const EVIDENCE_TABS = [
  { label: 'Achievements', icon: Award },
  { label: 'Skills & Tools', icon: Wrench },
  { label: 'Work History', icon: Briefcase },
  { label: 'Education', icon: GraduationCap },
  { label: 'Leadership', icon: Users },
];

function normalizeSkills(skills: ParsedData['skills']): { category: string; items: string[] }[] {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills.map((group) => {
      if (typeof group === 'string') {
        return { category: 'Skills', items: [group] };
      }

      return {
        category: group.category || 'Skills',
        items: Array.isArray(group.items) ? group.items : [],
      };
    });
  }

  return Object.entries(skills)
    .filter(([, items]) => Array.isArray(items) && items.length > 0)
    .map(([category, items]) => ({
      category: category.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      items: Array.isArray(items) ? items : [],
    }));
}

function normalizeMetrics(metrics?: string[] | string) {
  if (!metrics) return [] as string[];
  return Array.isArray(metrics) ? metrics : [metrics];
}

function formatLabel(label: string) {
  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
}

function normalizeContactInfo(parsed: ParsedData | null): ContactInfo {
  if (!parsed) return {};

  const contactSource = [parsed.contact_info, parsed.contact, parsed.basics, parsed.personal_info]
    .find((value) => value && typeof value === 'object') as ContactInfo | undefined;

  return {
    name: getFirstString(contactSource?.name, parsed.name),
    email: getFirstString(contactSource?.email, parsed.email),
    phone: getFirstString(contactSource?.phone, parsed.phone),
    location: getFirstString(contactSource?.location, parsed.location),
    linkedin: getFirstString(contactSource?.linkedin, parsed.linkedin),
    website: getFirstString(contactSource?.website, parsed.website, parsed.portfolio),
  };
}

function normalizeWorkExperience(parsed: ParsedData | null): ParsedWorkItem[] {
  const source = parsed?.work_history || parsed?.work_experience || parsed?.experience;
  if (!Array.isArray(source)) return [];

  return source.map((item) => {
    const company = getFirstString(item.company, (item as WorkHistoryItem & { employer?: string }).employer, (item as WorkHistoryItem & { organization?: string }).organization) || 'Company not provided';
    const title = getFirstString(item.title, (item as WorkHistoryItem & { role?: string }).role, (item as WorkHistoryItem & { position?: string }).position) || 'Title not provided';
    const start = getFirstString(item.start_date, item.start);
    const end = getFirstString(item.end_date, item.end) || 'Present';
    const bulletsSource = (item as WorkHistoryItem & { bullets?: string[]; achievements?: string[]; responsibilities?: string[] }).bullets
      || (item as WorkHistoryItem & { bullets?: string[]; achievements?: string[]; responsibilities?: string[] }).achievements
      || (item as WorkHistoryItem & { bullets?: string[]; achievements?: string[]; responsibilities?: string[] }).responsibilities
      || item.highlights
      || [];

    return {
      company,
      title,
      dates: start ? `${start} - ${end}` : end,
      bullets: Array.isArray(bulletsSource) ? bulletsSource.filter(Boolean) : [],
    };
  });
}

function normalizeEducation(parsed: ParsedData | null): ParsedEducationItem[] {
  const source = parsed?.education || parsed?.education_history;
  if (!Array.isArray(source)) return [];

  return source.map((item) => {
    const institution = getFirstString(item.institution, (item as EducationItem & { school?: string }).school) || 'Institution not provided';
    const degree = getFirstString(item.degree, (item as EducationItem & { credential?: string }).credential) || 'Degree not provided';
    const detailParts = [getFirstString(item.field), getFirstString(item.year)].filter(Boolean);

    return {
      institution,
      degree,
      details: detailParts.join(' • '),
    };
  });
}

function normalizeExtractedSkills(parsed: ParsedData | null) {
  const skillGroups = normalizeSkills(parsed?.skills);
  const tools = Array.isArray(parsed?.tools)
    ? parsed.tools
        .map((tool) => {
          if (!tool.name) return '';
          return tool.proficiency ? `${tool.name} (${tool.proficiency})` : tool.name;
        })
        .filter(Boolean)
    : [];

  if (!tools.length) return skillGroups;

  return [...skillGroups, { category: 'Tools', items: tools }];
}

export default function ResumeClient({ initialResume, initialParsedData, itemsExtracted }: ResumeClientProps) {
  const [resume, setResume] = useState<Resume | null>(initialResume);
  const [parsed, setParsed] = useState<ParsedData | null>(initialParsedData);
  const [items, setItems] = useState(itemsExtracted);
  const [activeTab, setActiveTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      const payload = data.data || data;
      if (payload.resume) {
        setResume(payload.resume);
        setParsed(payload.parsed_data || null);
        setItems(payload.items_extracted || 0);
      }
    } catch {
      // handled silently until toast system is added
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async () => {
    if (!resume) return;
    const response = await fetch(`/api/resume/${resume.id}`, { method: 'DELETE' });
    if (!response.ok) return;
    setResume(null);
    setParsed(null);
    setItems(0);
  };

  const normalizedSkills = normalizeSkills(parsed?.skills);
  const leadershipItems = parsed?.leadership || parsed?.leadership_stories || [];
  const contactInfo = normalizeContactInfo(parsed);
  const extractedWorkExperience = normalizeWorkExperience(parsed);
  const extractedEducation = normalizeEducation(parsed);
  const extractedSkills = normalizeExtractedSkills(parsed);
  const contactEntries = Object.entries(contactInfo).filter(([, value]) => Boolean(value));

  if (!resume) {
    return (
      <div className={styles.page}>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className={styles.uploading}>
              <div className={styles.spinner} />
              Uploading and parsing your resume...
            </div>
          ) : (
            <>
              <div className={styles.dropzoneIcon}>
                <Upload size={32} strokeWidth={1.5} />
              </div>
              <div className={styles.dropzoneTitle}>Upload your primary resume</div>
              <div className={styles.dropzoneText}>
                Drop your resume here or click to browse. WorthApply turns it into reusable evidence for job-fit analysis and tailored applications.
              </div>
              <div className={styles.dropzoneHint}>PDF, DOC, or DOCX up to 10MB</div>
            </>
          )}
        </div>
      </div>
    );
  }

  const statusLabel = resume.parse_status === 'complete'
    ? 'Ready'
    : resume.parse_status === 'processing' || resume.parse_status === 'pending'
      ? 'Processing'
      : 'Uploaded only';
  const StatusIcon = resume.parse_status === 'complete'
    ? CheckCircle2
    : resume.parse_status === 'processing' || resume.parse_status === 'pending'
      ? Loader2
      : AlertCircle;
  const statusClass = resume.parse_status === 'complete'
    ? styles.statusParsed
    : resume.parse_status === 'processing' || resume.parse_status === 'pending'
      ? styles.statusPending
      : styles.statusFailed;

  return (
    <div className={styles.page}>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className={styles.fileInput}
        onChange={handleFileChange}
      />
      <div className={styles.panels}>
        <div className={styles.resumeCard}>
          <div className={styles.resumeIcon}>
            <FileText size={28} strokeWidth={1.5} />
          </div>
          <div className={styles.resumeFilename}>{resume.filename}</div>
          <div className={styles.resumeMeta}>
            <div className={styles.resumeMetaRow}>
              <Clock size={14} />
              Uploaded {new Date(resume.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className={styles.resumeMetaRow}>
              <span className={`${styles.statusBadge} ${statusClass}`}>
                <StatusIcon size={12} className={resume.parse_status === 'processing' ? styles.spinningIcon : undefined} />
                {statusLabel}
              </span>
            </div>
            <div className={styles.resumeMetaRow}>
              <Award size={14} />
              {items} evidence items extracted
            </div>
          </div>
          <div className={styles.resumeActions}>
            <button className={styles.btnPrimary} onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Upload New
            </button>
            {resume.file_url ? (
              <a href={resume.file_url} download className={styles.btnSecondary}>
                <Download size={16} /> Download
              </a>
            ) : null}
            <button className={styles.btnDanger} onClick={handleDelete}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
          {uploading && (
            <div className={styles.uploading}>
              <div className={styles.spinner} />
              Uploading new resume...
            </div>
          )}

          {parsed && resume.parse_status === 'complete' && (
            <details className={styles.extractedPanel} open>
              <summary className={styles.extractedSummary}>
                <div>
                  <div className={styles.extractedEyebrow}>Parser check</div>
                  <div className={styles.extractedTitle}>View what we extracted</div>
                  <div className={styles.extractedDescription}>
                    Review the structured resume data below to confirm the parser captured the right details.
                  </div>
                </div>
              </summary>

              <div className={styles.extractedContent}>
                <div className={styles.extractSection}>
                  <div className={styles.extractSectionTitle}>Contact info</div>
                  {contactEntries.length ? (
                    <div className={styles.contactGrid}>
                      {contactEntries.map(([label, value]) => (
                        <div key={label} className={styles.contactCard}>
                          <div className={styles.contactLabel}>{formatLabel(label)}</div>
                          <div className={styles.contactValue}>{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.extractedEmpty}>No contact info was extracted.</div>
                  )}
                </div>

                <div className={styles.extractSection}>
                  <div className={styles.extractSectionTitle}>Work experience</div>
                  {extractedWorkExperience.length ? (
                    <div className={styles.extractedList}>
                      {extractedWorkExperience.map((item, index) => (
                        <div key={`${item.company}-${item.title}-${index}`} className={styles.extractCard}>
                          <div className={styles.extractCardHeader}>
                            <div>
                              <div className={styles.extractCardTitle}>{item.title}</div>
                              <div className={styles.extractCardSubtitle}>{item.company}</div>
                            </div>
                            <div className={styles.extractCardMeta}>{item.dates}</div>
                          </div>
                          {item.bullets.length ? (
                            <ul className={styles.extractBulletList}>
                              {item.bullets.map((bullet, bulletIndex) => (
                                <li key={`${index}-${bulletIndex}`} className={styles.extractBullet}>{bullet}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className={styles.extractedEmptyInline}>No bullet points were extracted for this role.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.extractedEmpty}>No work experience was extracted.</div>
                  )}
                </div>

                <div className={styles.extractSection}>
                  <div className={styles.extractSectionTitle}>Education</div>
                  {extractedEducation.length ? (
                    <div className={styles.extractedList}>
                      {extractedEducation.map((item, index) => (
                        <div key={`${item.institution}-${index}`} className={styles.extractCard}>
                          <div className={styles.extractCardTitle}>{item.institution}</div>
                          <div className={styles.extractCardSubtitle}>{item.degree}</div>
                          {item.details ? <div className={styles.extractCardMeta}>{item.details}</div> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.extractedEmpty}>No education entries were extracted.</div>
                  )}
                </div>

                <div className={styles.extractSection}>
                  <div className={styles.extractSectionTitle}>Skills</div>
                  {extractedSkills.length ? (
                    extractedSkills.map((group, index) => (
                      <div key={`${group.category}-${index}`} className={styles.skillCategory}>
                        <div className={styles.categoryLabel}>{group.category}</div>
                        <div className={styles.skillGrid}>
                          {group.items.map((skill, skillIndex) => (
                            <span key={`${group.category}-${skillIndex}`} className={styles.skillTag}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.extractedEmpty}>No skills were extracted.</div>
                  )}
                </div>

                <div className={styles.extractedHelper}>This looks wrong? Upload a different version.</div>
              </div>
            </details>
          )}
        </div>

        <div className={styles.evidencePanel}>
          <div className={styles.tabList}>
            {EVIDENCE_TABS.map((t, i) => (
              <button
                key={t.label}
                className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {!parsed ? (
              <div className={styles.emptyEvidence}>
                <FileText size={48} className={styles.emptyEvidenceIcon} />
                <div className={styles.emptyEvidenceText}>
                  {resume.parse_status === 'processing' || resume.parse_status === 'pending'
                    ? 'Resume is being processed...'
                    : resume.parse_status === 'failed'
                      ? 'Your resume file is stored, but structured extraction is unavailable right now.'
                      : 'No evidence data available yet'}
                </div>
              </div>
            ) : (
              <>
                {activeTab === 0 && (
                  parsed.achievements?.length ? parsed.achievements.map((achievement, i) => (
                    <div key={i} className={styles.achievementCard}>
                      <div className={styles.achievementText}>{achievement.text}</div>
                      <div className={styles.achievementMeta}>
                        {normalizeMetrics(achievement.metrics).map((metric, j) => <span key={j} className={styles.metricTag}>{metric}</span>)}
                        {achievement.tags?.map((tag, j) => <span key={j} className={styles.tag}>{tag}</span>)}
                      </div>
                    </div>
                  )) : <div className={styles.emptyEvidence}><div className={styles.emptyEvidenceText}>No achievements extracted yet</div></div>
                )}

                {activeTab === 1 && (
                  normalizedSkills.length ? normalizedSkills.map((category, i) => (
                    <div key={i} className={styles.skillCategory}>
                      <div className={styles.categoryLabel}>{category.category}</div>
                      <div className={styles.skillGrid}>
                        {category.items.map((skill, j) => <span key={j} className={styles.skillTag}>{skill}</span>)}
                      </div>
                    </div>
                  )) : <div className={styles.emptyEvidence}><div className={styles.emptyEvidenceText}>No skills extracted yet</div></div>
                )}

                {activeTab === 2 && (
                  parsed.work_history?.length ? parsed.work_history.map((workItem, i) => (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineCompany}>{workItem.company}</div>
                      <div className={styles.timelineTitle}>{workItem.title}</div>
                      <div className={styles.timelineDates}>{workItem.start_date || workItem.start} - {workItem.end_date || workItem.end || 'Present'}</div>
                      {workItem.highlights?.length ? (
                        <div className={styles.timelineHighlights}>
                          {workItem.highlights.map((highlight, j) => <div key={j} className={styles.highlight}>{highlight}</div>)}
                        </div>
                      ) : null}
                    </div>
                  )) : <div className={styles.emptyEvidence}><div className={styles.emptyEvidenceText}>No work history extracted yet</div></div>
                )}

                {activeTab === 3 && (
                  parsed.education?.length ? parsed.education.map((educationItem, i) => (
                    <div key={i} className={styles.educationCard}>
                      <div className={styles.educationInstitution}>{educationItem.institution}</div>
                      <div className={styles.educationDegree}>{educationItem.degree}{educationItem.field ? ` in ${educationItem.field}` : ''}</div>
                      <div className={styles.educationYear}>{educationItem.year || 'Year not provided'}</div>
                    </div>
                  )) : <div className={styles.emptyEvidence}><div className={styles.emptyEvidenceText}>No education data extracted yet</div></div>
                )}

                {activeTab === 4 && (
                  leadershipItems.length ? leadershipItems.map((item, i) => (
                    <div key={i} className={styles.storyCard}>
                      <div className={styles.storyTitle}>{item.title || 'Leadership story'}</div>
                      <div className={styles.storyText}>{item.story || item.text}</div>
                    </div>
                  )) : <div className={styles.emptyEvidence}><div className={styles.emptyEvidenceText}>No leadership stories extracted yet</div></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
