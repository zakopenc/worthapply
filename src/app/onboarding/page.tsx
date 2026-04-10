'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  CurrencyDollar,
  MapPin,
  MagnifyingGlass,
  Sparkle,
  SquaresFour,
  Target,
  UploadSimple,
  Wallet,
  X,
} from '@phosphor-icons/react';
import Topbar from '@/components/app/Topbar';
import { createClient } from '@/lib/supabase/client';
import styles from './onboarding.module.css';

const STEPS = [
  { title: 'Upload your resume', short: 'Resume' },
  { title: 'Search goals', short: 'Goals' },
  { title: 'Preferences', short: 'Preferences' },
  { title: 'All set', short: 'Complete' },
] as const;

const STEP_ICONS = [
  UploadSimple,
  Briefcase,
  CurrencyDollar,
  Sparkle,
];

const WORK_PREFERENCES = [
  { value: 'remote', label: 'Remote', desc: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Mix of office & remote' },
  { value: 'onsite', label: 'On-site', desc: 'In-office full time' },
] as const;

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * 360,
  distance: 60 + Math.random() * 80,
  size: 4 + Math.random() * 6,
  color: ['#c68a71', '#ddb09c', '#f4a261', '#84523c', '#e8c4b0'][i % 5],
  delay: Math.random() * 0.3,
}));

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function OnboardingPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
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
      if (!response.ok) throw new Error(payload.error || 'Unable to upload and parse your resume right now.');
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
    const { data: { user } } = await supabase.auth.getUser();
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
    setDirection(1);
    try {
      await saveStep();
      if (step === 2) {
        const { data: { user } } = await supabase.auth.getUser();
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
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 0));
  };

  const skip = async () => { await next(); };

  const StepIcon = STEP_ICONS[step];

  return (
    <>
      <Topbar title="Get Started" breadcrumb="Workspace / Onboarding" />
      <div className={styles.page}>
        <section className={styles.wizard}>
          {/* Slim progress bar */}
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
            />
          </div>

          {/* Step dots */}
          <div className={styles.stepDots}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i === step ? styles.dotActive : ''} ${i < step ? styles.dotDone : ''}`}
              />
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              className={styles.errorBanner}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          {/* Step content with slide transitions */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
              className={styles.stepContent}
            >
              {/* Step icon */}
              {step < 3 && (
                <motion.div
                  className={styles.stepIconCircle}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <StepIcon size={40} weight="duotone" />
                </motion.div>
              )}

              {/* Step header */}
              {step < 3 && (
                <div className={styles.stepHeader}>
                  <motion.div
                    className={styles.stepLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    Step {step + 1} of {STEPS.length}
                  </motion.div>
                  <h2 className={styles.stepTitle}>{STEPS[step].title}</h2>
                </div>
              )}

              {/* ─── Step 0: Resume Upload ─── */}
              {step === 0 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepSubtitle}>
                    We&apos;ll parse your resume into an evidence bank so job analysis and tailoring have real material to work with.
                  </p>

                  <div
                    className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
                        <strong>Uploading and parsing&hellip;</strong>
                        <span>This usually takes just a moment.</span>
                      </div>
                    ) : uploadedFile ? (
                      <motion.div
                        className={styles.uploadSuccess}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <CheckCircle size={28} weight="fill" className={styles.successIcon} />
                        <div>
                          <strong>{uploadedFile}</strong>
                          <span>Your resume is ready for job-fit analysis.</span>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div className={styles.dropzoneIcon}>
                          <UploadSimple size={32} weight="duotone" />
                        </div>
                        <div className={styles.dropzoneTitle}>Drop your resume here</div>
                        <div className={styles.dropzoneText}>
                          PDF, DOC, or DOCX &middot; Click to browse
                        </div>
                      </>
                    )}
                  </div>

                  <div className={styles.tipPanel}>
                    <strong>Tips for best results</strong>
                    <ul className={styles.tipList}>
                      <li>Use a current resume with measurable bullets</li>
                      <li>Clear section headers: Experience, Skills, Education</li>
                      <li>One polished version rather than multiple drafts</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ─── Step 1: Search Goals ─── */}
              {step === 1 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepSubtitle}>
                    Help WorthApply score opportunities through the lens of what you actually want.
                  </p>

                  <div className={styles.formGrid}>
                    <motion.div
                      className={styles.field}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
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
                          placeholder="e.g. Product Manager, UX Designer&hellip;"
                          value={titleInput}
                          onChange={(e) => setTitleInput(e.target.value)}
                          onKeyDown={handleTitleKey}
                        />
                      </div>
                      <p className={styles.helperText}>Press Enter or comma after each title</p>
                    </motion.div>

                    <motion.div
                      className={styles.field}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
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
                              <span>{item.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>

                    <motion.div
                      className={styles.field}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
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
                          placeholder="e.g. Fintech, Healthcare, SaaS&hellip;"
                          value={industryInput}
                          onChange={(e) => setIndustryInput(e.target.value)}
                          onKeyDown={handleIndustryKey}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* ─── Step 2: Compensation & Location ─── */}
              {step === 2 && (
                <div className={styles.stepBody}>
                  <p className={styles.stepSubtitle}>
                    Set constraints so WorthApply surfaces roles that actually fit your life.
                  </p>

                  <div className={styles.formGrid}>
                    <motion.div
                      className={styles.field}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className={styles.label}>Salary range (USD)</label>
                      <div className={styles.rangeRow}>
                        <input
                          className={styles.rangeInput}
                          type="number"
                          placeholder="Min"
                          value={salaryMin}
                          onChange={(e) => setSalaryMin(e.target.value)}
                        />
                        <span className={styles.rangeSep}>&mdash;</span>
                        <input
                          className={styles.rangeInput}
                          type="number"
                          placeholder="Max"
                          value={salaryMax}
                          onChange={(e) => setSalaryMax(e.target.value)}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className={styles.field}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
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
                          placeholder="e.g. San Francisco, Remote US&hellip;"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          onKeyDown={handleLocationKey}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className={styles.field}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className={styles.label}>Open to relocation?</label>
                      <button
                        type="button"
                        className={`${styles.toggleCard} ${openToRelocation ? styles.toggleCardActive : ''}`}
                        onClick={() => setOpenToRelocation(!openToRelocation)}
                      >
                        <div>
                          <strong>{openToRelocation ? 'Yes, open to relocating' : 'No, staying local'}</strong>
                          <span>{openToRelocation ? 'Include relocation-friendly roles' : 'Prioritize local or remote opportunities'}</span>
                        </div>
                        <div className={`${styles.toggleSwitch} ${openToRelocation ? styles.toggleSwitchActive : ''}`} />
                      </button>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* ─── Step 3: Completion ─── */}
              {step === 3 && (
                <div className={styles.complete}>
                  {/* Particle burst */}
                  <div className={styles.particleContainer}>
                    {PARTICLES.map((p, i) => (
                      <motion.div
                        key={i}
                        className={styles.particle}
                        style={{ background: p.color, width: p.size, height: p.size }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                          y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                          opacity: 0,
                          scale: 0.2,
                        }}
                        transition={{ duration: 1.2, delay: 0.4 + p.delay, ease: 'easeOut' }}
                      />
                    ))}
                  </div>

                  {/* Animated checkmark */}
                  <motion.svg
                    viewBox="0 0 52 52"
                    className={styles.checkmark}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  >
                    <motion.circle
                      cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    />
                    <motion.path
                      d="M15 27l7 7 15-15" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.7, ease: 'easeOut' }}
                    />
                  </motion.svg>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className={styles.completeEyebrow}>You&apos;re all set</div>
                    <h2 className={styles.completeTitle}>Your workspace is ready</h2>
                    <p className={styles.completeText}>
                      Start analyzing roles or head to your dashboard to review everything.
                    </p>
                  </motion.div>

                  <motion.div
                    className={styles.completeStats}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className={styles.completeStat}>
                      <strong>{uploadedFile ? '1' : '0'}</strong>
                      <span>Resume</span>
                    </div>
                    <div className={styles.completeStat}>
                      <strong>{preferredTitles.length}</strong>
                      <span>Titles</span>
                    </div>
                    <div className={styles.completeStat}>
                      <strong>{preferredLocations.length}</strong>
                      <span>Locations</span>
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.completeLinks}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Link href="/analyzer" className={styles.completeLinkPrimary}>
                      <MagnifyingGlass size={18} weight="bold" /> Analyze a job
                    </Link>
                    <Link href="/dashboard" className={styles.completeLinkSecondary}>
                      <SquaresFour size={18} weight="duotone" /> Go to dashboard
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation — outside AnimatePresence so buttons don't slide */}
          {step < 3 && (
            <div className={styles.nav}>
              {step > 0 ? (
                <button className={styles.backBtn} onClick={back} disabled={saving}>
                  <ArrowLeft size={16} weight="bold" /> Back
                </button>
              ) : (
                <div />
              )}
              <div className={styles.navRight}>
                {step > 0 && (
                  <button className={styles.skipBtn} onClick={skip} disabled={saving}>Skip</button>
                )}
                <button
                  className={styles.nextBtn}
                  onClick={next}
                  disabled={saving || (step === 0 && !uploadedFile)}
                >
                  {saving ? 'Saving\u2026' : step === 2 ? 'Finish setup' : 'Continue'}
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
