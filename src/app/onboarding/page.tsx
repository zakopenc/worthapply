'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  MapPin,
  Search,
  Sparkles,
  Target,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import Topbar from '@/components/app/Topbar';
import { createClient } from '@/lib/supabase/client';
import styles from './onboarding.module.css';

const STEPS = [
  { title: 'Resume foundation', short: 'Resume' },
  { title: 'Search goals', short: 'Goals' },
  { title: 'Compensation and location', short: 'Preferences' },
  { title: 'Launch', short: 'Complete' },
] as const;

const WORK_PREFERENCES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
] as const;

function StepPreview({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewIcon}>{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [preferredTitles, setPreferredTitles] = useState<string[]>([]);
  const [titleInput, setTitleInput] = useState('');
  const [workPreference, setWorkPreference] = useState<string[]>([]);
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState('');

  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [openToRelocation, setOpenToRelocation] = useState(false);

  const progressPercentage = (step / (STEPS.length - 1)) * 100;

  const addTag = (list: string[], item: string, setter: (value: string[]) => void) => {
    const trimmed = item.trim();
    if (trimmed && !list.includes(trimmed)) setter([...list, trimmed]);
  };

  const removeTag = (list: string[], index: number, setter: (value: string[]) => void) => {
    setter(list.filter((_, i) => i !== index));
  };

  const handleTitleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(preferredTitles, titleInput, setPreferredTitles);
      setTitleInput('');
    }
  };

  const handleIndustryKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(targetIndustries, industryInput, setTargetIndustries);
      setIndustryInput('');
    }
  };

  const handleLocationKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(preferredLocations, locationInput, setPreferredLocations);
      setLocationInput('');
    }
  };

  const toggleWorkPref = (preference: string) => {
    setWorkPreference((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference]
    );
  };

  const handleUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to upload and parse your resume right now.');
      }

      setUploadedFile(file.name);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload your resume right now.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const saveStep = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('You must be signed in to continue onboarding.');

    if (step === 1) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          preferred_titles: preferredTitles,
          work_preference: workPreference,
          target_industries: targetIndustries,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
    }

    if (step === 2) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          salary_min: salaryMin ? Number(salaryMin) : null,
          salary_max: salaryMax ? Number(salaryMax) : null,
          preferred_locations: preferredLocations,
          open_to_relocation: openToRelocation,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
    }
  };

  const next = async () => {
    setSaving(true);
    setError('');

    try {
      await saveStep();

      if (step === 2) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ onboarding_complete: true })
            .eq('id', user.id);

          if (updateError) throw updateError;
        }
      }

      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save this step right now.');
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
  };

  const skip = async () => {
    await next();
  };

  const renderStepHeader = (title: string, subtitle: string) => (
    <div className={styles.stepHeader}>
      <div className={styles.stepEyebrow}>{STEPS[step].short}</div>
      <h2 className={styles.stepTitle}>{title}</h2>
      <p className={styles.stepSubtitle}>{subtitle}</p>
    </div>
  );

  return (
    <>
      <Topbar title="Get Started" breadcrumb="Workspace / Onboarding" />
      <motion.div
        className={styles.page}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
      >
        <section className={styles.heroCard}>
          <div>
            <div className={styles.heroEyebrow}>WorthApply setup</div>
            <h1 className={styles.heroTitle}>Build the profile that powers better-fit applications.</h1>
            <p className={styles.heroText}>
              In a few minutes, you’ll give WorthApply the context it needs to analyze jobs, tailor resumes, and focus your effort where it has the highest return.
            </p>
          </div>

          <div className={styles.previewGrid}>
            <StepPreview icon={<Upload size={18} />} title="Resume evidence" text="Upload your resume so WorthApply can extract the proof points behind your experience." />
            <StepPreview icon={<Target size={18} />} title="Career direction" text="Define the titles and industries that should shape future matches." />
            <StepPreview icon={<Wallet size={18} />} title="Compensation fit" text="Set salary expectations so you stop wasting effort on misaligned roles." />
            <StepPreview icon={<MapPin size={18} />} title="Location logic" text="Add location preferences and relocation flexibility to improve targeting." />
          </div>
        </section>

        <section className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <div>
              <div className={styles.progressEyebrow}>Progress</div>
              <div className={styles.progressTitle}>Step {step + 1} of {STEPS.length}: {STEPS[step].title}</div>
            </div>
            <div className={styles.progressPercent}>{Math.round(progressPercentage)}%</div>
          </div>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
          </div>

          <div className={styles.progressChips}>
            {STEPS.map((item, index) => (
              <div
                key={item.title}
                className={`${styles.progressChip} ${index === step ? styles.progressChipActive : ''} ${index < step ? styles.progressChipDone : ''}`}
              >
                <span>{index + 1}</span>
                <strong>{item.short}</strong>
              </div>
            ))}
          </div>
        </section>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        <section className={styles.card}>
          {step === 0 && (
            <>
              {renderStepHeader(
                'Upload your resume',
                'We’ll parse your resume into an evidence bank so job analysis and tailoring have real material to work with.'
              )}

              <div className={styles.stepLayout}>
                <div
                  className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className={styles.fileInput}
                    onChange={handleFileChange}
                  />

                  {uploading ? (
                    <div className={styles.uploading}>
                      <div className={styles.spinner} />
                      <strong>Uploading and parsing your resume…</strong>
                      <span>This usually takes just a moment.</span>
                    </div>
                  ) : uploadedFile ? (
                    <div className={styles.uploadSuccess}>
                      <CheckCircle2 size={22} />
                      <div>
                        <strong>{uploadedFile}</strong>
                        <span>Your resume is ready for job-fit analysis.</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.dropzoneIcon}><Upload size={28} strokeWidth={1.6} /></div>
                      <div className={styles.dropzoneTitle}>Drop your resume here</div>
                      <div className={styles.dropzoneText}>Click to browse or drag a PDF, DOC, or DOCX file into the workspace.</div>
                    </>
                  )}
                </div>

                <div className={styles.tipPanel}>
                  <h3>Best results come from:</h3>
                  <ul className={styles.tipList}>
                    <li>a current resume with measurable bullets</li>
                    <li>clear section headers like Experience, Skills, and Education</li>
                    <li>one polished version rather than multiple rough drafts</li>
                  </ul>
                </div>
              </div>

              <div className={styles.nav}>
                <div />
                <div className={styles.navRight}>
                  <button 
                    className={styles.nextBtn} 
                    onClick={next} 
                    disabled={saving || !uploadedFile}
                    title={!uploadedFile ? 'Please upload your resume to continue' : ''}
                  >
                    {saving ? 'Saving…' : 'Next'} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {renderStepHeader(
                'Clarify your search goals',
                'This helps WorthApply score opportunities through the lens of what you actually want, not just what you could do.'
              )}

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Preferred job titles</label>
                  <div className={styles.tagInput}>
                    {preferredTitles.map((title, index) => (
                      <span key={title + index} className={styles.tagItem}>
                        {title}
                        <button type="button" className={styles.tagRemove} onClick={() => removeTag(preferredTitles, index, setPreferredTitles)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      className={styles.tagInputField}
                      placeholder="IT Manager, Systems Engineer, Security Analyst…"
                      value={titleInput}
                      onChange={(event) => setTitleInput(event.target.value)}
                      onKeyDown={handleTitleKey}
                    />
                  </div>
                  <p className={styles.helperText}>Press Enter or comma after each title.</p>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Work preference</label>
                  <div className={styles.choiceGrid}>
                    {WORK_PREFERENCES.map((item) => {
                      const active = workPreference.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          className={`${styles.choiceCard} ${active ? styles.choiceCardActive : ''}`}
                          onClick={() => toggleWorkPref(item.value)}
                        >
                          <strong>{item.label}</strong>
                          <span>{active ? 'Selected' : 'Tap to include in your search'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Target industries</label>
                  <div className={styles.tagInput}>
                    {targetIndustries.map((industry, index) => (
                      <span key={industry + index} className={styles.tagItem}>
                        {industry}
                        <button type="button" className={styles.tagRemove} onClick={() => removeTag(targetIndustries, index, setTargetIndustries)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      className={styles.tagInputField}
                      placeholder="Fintech, healthcare, government, SaaS…"
                      value={industryInput}
                      onChange={(event) => setIndustryInput(event.target.value)}
                      onKeyDown={handleIndustryKey}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.nav}>
                <button className={styles.backBtn} onClick={back} disabled={saving}><ArrowLeft size={16} /> Back</button>
                <div className={styles.navRight}>
                  <button className={styles.skipBtn} onClick={skip} disabled={saving}>Skip</button>
                  <button className={styles.nextBtn} onClick={next} disabled={saving}>
                    {saving ? 'Saving…' : 'Next'} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {renderStepHeader(
                'Set compensation and location preferences',
                'These filters reduce wasted effort by helping WorthApply surface roles that fit your real-world constraints.'
              )}

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Salary range (USD)</label>
                  <div className={styles.rangeRow}>
                    <input
                      className={styles.rangeInput}
                      type="number"
                      placeholder="Minimum"
                      value={salaryMin}
                      onChange={(event) => setSalaryMin(event.target.value)}
                    />
                    <span className={styles.rangeSep}>to</span>
                    <input
                      className={styles.rangeInput}
                      type="number"
                      placeholder="Maximum"
                      value={salaryMax}
                      onChange={(event) => setSalaryMax(event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Preferred locations</label>
                  <div className={styles.tagInput}>
                    {preferredLocations.map((location, index) => (
                      <span key={location + index} className={styles.tagItem}>
                        {location}
                        <button type="button" className={styles.tagRemove} onClick={() => removeTag(preferredLocations, index, setPreferredLocations)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      className={styles.tagInputField}
                      placeholder="Phoenix, remote in US, Dallas…"
                      value={locationInput}
                      onChange={(event) => setLocationInput(event.target.value)}
                      onKeyDown={handleLocationKey}
                    />
                  </div>
                  <p className={styles.helperText}>Add as many geographies or remote preferences as you need.</p>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Open to relocation</label>
                  <button
                    type="button"
                    className={`${styles.toggleCard} ${openToRelocation ? styles.toggleCardActive : ''}`}
                    onClick={() => setOpenToRelocation(!openToRelocation)}
                  >
                    <div>
                      <strong>{openToRelocation ? 'Yes, I can relocate' : 'No, keep me local'}</strong>
                      <span>{openToRelocation ? 'WorthApply can include relocation-friendly roles.' : 'WorthApply will prioritize local or remote opportunities.'}</span>
                    </div>
                    <div className={`${styles.toggleSwitch} ${openToRelocation ? styles.toggleSwitchActive : ''}`} />
                  </button>
                </div>
              </div>

              <div className={styles.nav}>
                <button className={styles.backBtn} onClick={back} disabled={saving}><ArrowLeft size={16} /> Back</button>
                <div className={styles.navRight}>
                  <button className={styles.skipBtn} onClick={skip} disabled={saving}>Skip</button>
                  <button className={styles.nextBtn} onClick={next} disabled={saving}>
                    {saving ? 'Saving…' : 'Finish setup'} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className={styles.complete}>
              <div className={styles.completeIcon}><Sparkles size={34} strokeWidth={1.6} /></div>
              <div className={styles.completeEyebrow}>Ready to go</div>
              <h2 className={styles.completeTitle}>Your WorthApply workspace is set up.</h2>
              <p className={styles.completeText}>
                You can start analyzing roles immediately, or head to the dashboard to review your workspace and pipeline.
              </p>
              <div className={styles.completeStats}>
                <div className={styles.completeStat}><strong>{uploadedFile ? '1' : '0'}</strong><span>Resume uploaded</span></div>
                <div className={styles.completeStat}><strong>{preferredTitles.length}</strong><span>Target titles</span></div>
                <div className={styles.completeStat}><strong>{preferredLocations.length}</strong><span>Preferred locations</span></div>
              </div>
              <div className={styles.completeLinks}>
                <Link href="/analyzer" className={styles.completeLinkPrimary}><Search size={18} /> Analyze a job</Link>
                <Link href="/dashboard" className={styles.completeLinkSecondary}><LayoutDashboard size={18} /> Go to dashboard</Link>
              </div>
            </div>
          )}
        </section>
      </motion.div>
    </>
  );
}
