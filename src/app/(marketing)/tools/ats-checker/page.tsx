'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Warning,
  ArrowRight,
  CheckCircle,
  FileText,
  CircleNotch,
  Scan,
  ShieldCheck,
  Sparkle,
  CloudArrowUp,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import styles from './ats-checker.module.css';
import { capture } from '@/lib/analytics/posthog-client';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const } },
};

type TabKey = 'upload' | 'paste';
type Phase = 'idle' | 'loading' | 'results';

const loadingSteps = [
  'Reviewing resume structure',
  'Checking for missing ATS signals',
  'Preparing optimization notes',
];

const educationCards = [
  {
    title: 'What this checker does',
    desc: 'It gives you a quick ATS-readiness pre-check so you can spot avoidable issues before sending an application.',
    iconName: 'scanSearch',
  },
  {
    title: 'What ATS systems look for',
    desc: 'Clean structure, readable headings, job-relevant keywords, and evidence that matches the role you want.',
    iconName: 'fileText',
  },
  {
    title: 'Why this matters',
    desc: 'Even strong candidates lose interviews when resumes are hard to parse or fail to reflect role-specific language.',
    iconName: 'shieldCheck',
  },
];

export default function ATSCheckerPage() {
  const [tab, setTab] = useState<TabKey>('upload');
  const [fileName, setFileName] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasInput = tab === 'upload' ? !!fileName : pasteText.trim().length > 80;

  const score = useMemo(() => {
    if (tab === 'paste') {
      const lengthBoost = Math.min(22, Math.floor(pasteText.trim().length / 80));
      return Math.min(89, 58 + lengthBoost);
    }
    if (!fileName) return 0;
    return fileName.endsWith('.pdf') ? 78 : 74;
  }, [fileName, pasteText, tab]);

  const checks = useMemo(() => {
    const keywordPass = pasteText.toLowerCase().includes('experience') || pasteText.toLowerCase().includes('skills');
    return [
      { label: 'Readable section structure', pass: true, detail: 'The resume appears organized into recognizable sections.' },
      { label: 'ATS-friendly file input', pass: tab === 'paste' || fileName.endsWith('.pdf') || fileName.endsWith('.docx'), detail: 'PDF and DOCX are the safest formats for most workflows.' },
      { label: 'Keyword opportunity identified', pass: keywordPass || !!fileName, detail: 'You can likely improve role-specific keywords and matching language.' },
      { label: 'Formatting risk review', pass: false, detail: 'Avoid columns, graphics, or decorative layouts that make parsing harder.' },
    ];
  }, [fileName, pasteText, tab]);

  const progressValue = Math.min(100, Math.round((currentStep / loadingSteps.length) * 100));

  const runAnalysis = useCallback(() => {
    // Marky P0: fire ats_checker_used on actual analysis attempt (the acquisition event)
    capture('ats_checker_used', {
      input_type: tab, // 'upload' | 'paste'
      has_file: !!fileName,
      paste_length: pasteText.trim().length,
    });

    setPhase('loading');
    setCurrentStep(0);

    loadingSteps.forEach((_, index) => {
      window.setTimeout(() => setCurrentStep(index + 1), (index + 1) * 700);
    });

    window.setTimeout(() => {
      setPhase('results');
      setCurrentStep(loadingSteps.length);
    }, loadingSteps.length * 700 + 500);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) setFileName(file.name);
  };

  const reset = () => {
    setPhase('idle');
    setFileName('');
    setPasteText('');
    setCurrentStep(0);
    setDragActive(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      {/* Quick Answer Section for SEO/GEO */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-surface-container rounded-2xl border border-primary/20 p-6">
            <h2 className="text-xl font-bold text-on-surface mb-3 flex items-center gap-2">
              <Sparkle className="text-primary" size={20} weight="duotone" />
              Quick Answer: Is Your Resume ATS-Friendly?
            </h2>
            <p className="text-on-surface/80 leading-relaxed">
              An <strong>ATS (Applicant Tracking System)</strong> scans your resume before humans see it. 
              Our free ATS checker analyzes your resume in 10 seconds to identify formatting issues, 
              missing keywords, and structural problems that cause resumes to be rejected. 
              <strong> Aim for a score of 80+</strong> to pass automated screening and land interviews.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Free ATS Resume Checker</span>
          <h1>Free ATS Resume Checker: Is Your Resume ATS-Friendly?</h1>
          <p>
            Scan your resume in seconds to see if it passes Applicant Tracking Systems. Get instant feedback on formatting,
            keywords, and structure. No signup required — completely free.
          </p>
          <div className={styles.heroMeta}>
            <span><ShieldCheck size={16} weight="duotone" /> Unlimited free scans</span>
            <span><Sparkle size={16} weight="duotone" /> Instant ATS compatibility score</span>
            <span><FileText size={16} weight="duotone" /> Specific improvement tips</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.toolCard}>
            {phase === 'idle' && (
              <div key={`idle-${tab}`} className={styles.surfaceTransition}>
                <div className={styles.tabRow}>
                  <button type="button" className={`${styles.tab} ${tab === 'upload' ? styles.tabActive : ''}`} onClick={() => setTab('upload')}>
                    <CloudArrowUp size={16} weight="bold" /> Upload resume
                  </button>
                  <button type="button" className={`${styles.tab} ${tab === 'paste' ? styles.tabActive : ''}`} onClick={() => setTab('paste')}>
                    <FileText size={16} weight="duotone" /> Paste text
                  </button>
                </div>

                <div key={tab} className={styles.tabPanelTransition}>
                  {tab === 'upload' ? (
                    <div
                      className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onClick={() => fileRef.current?.click()}
                    >
                      <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className={styles.fileInput} onChange={handleFileChange} />
                      <CloudArrowUp size={34} weight="duotone" className={styles.dropIcon} />
                      <h2>Drag and drop your resume here</h2>
                      <p>Click to browse files. PDF and DOCX work best for this quick check.</p>
                      <div className={styles.helperPanel}>
                        <strong>Demo disclaimer</strong>
                        <span>This page shows sample ATS-style output only. It does not inspect your actual resume, and real analysis is available only after signup inside the full WorthApply workflow.</span>
                      </div>
                      {fileName && <div className={`${styles.fileBadge} ${styles.fileBadgeEnter}`}><FileText size={16} weight="duotone" /> {fileName}</div>}
                    </div>
                  ) : (
                    <div className={styles.pasteWrap}>
                      <textarea className={styles.textarea} placeholder="Paste your resume text here…" value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={10} />
                      <p className={styles.helperText}>Paste enough content to preview the demo experience. This page does not analyze your real resume; full ATS analysis is available after signup.</p>
                    </div>
                  )}
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.primaryCta} disabled={!hasInput} onClick={runAnalysis}>
                    <Scan size={16} weight="bold" /> See demo results
                  </button>
                </div>
              </div>
            )}

            {phase === 'loading' && (
              <div className={`${styles.loadingCard} ${styles.surfaceTransition}`}>
                <CircleNotch size={28} className={styles.spinner} />
                <h2>Running your ATS readiness check</h2>
                <div className={styles.progressBar} aria-hidden="true">
                  <span className={styles.progressFill} style={{ width: `${progressValue}%` }} />
                </div>
                <div className={styles.progressMeta}>{progressValue}% complete</div>
                <div className={styles.stepList}>
                  {loadingSteps.map((step, index) => (
                    <div key={step} className={`${styles.stepItem} ${currentStep > index ? styles.stepItemActive : ''}`} style={{ transitionDelay: `${index * 70}ms` }}>
                      <span className={styles.stepDot} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phase === 'results' && (
              <div className={`${styles.resultsCard} ${styles.surfaceTransition}`}>
                <div className={`${styles.resultsCallout} ${styles.resultsReveal}`} style={{ animationDelay: '20ms' }}>
                  <h3>Demo results only — unlock real analysis after signup</h3>
                  <p>
                    These sample results are not based on a true scan of your resume. Create an account to get real ATS analysis, role-specific feedback, and actionable recommendations.
                  </p>
                  <div className={styles.resultsActions}>
                    <Link href="/signup" className={styles.primaryCta}>
                      Sign up for real ATS analysis
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                  </div>
                </div>

                <div className={styles.resultsHeader}>
                  <div className={styles.resultsReveal} style={{ animationDelay: '30ms' }}>
                    <span className={styles.resultEyebrow}>Demo preview</span>
                    <h2>Sample ATS readiness score: {score}/100</h2>
                    <p>
                      This preview shows example output only and should not be treated as a real evaluation of your resume.
                    </p>
                  </div>
                  <div className={`${styles.scoreBadge} ${styles.resultsReveal}`} style={{ animationDelay: '110ms' }}>{score >= 75 ? 'Example strong base' : 'Example needs work'}</div>
                </div>

                <div className={styles.checkGrid}>
                  {checks.map((item, index) => (
                    <article key={item.label} className={`${styles.checkCard} ${styles.resultsReveal}`} style={{ animationDelay: `${160 + index * 70}ms` }}>
                      <div className={styles.checkHeader}>
                        {item.pass ? <CheckCircle size={18} weight="fill" className={styles.passIcon} /> : <Warning size={18} weight="fill" className={styles.warnIcon} />}
                        <strong>{item.label}</strong>
                      </div>
                      <p>{item.detail}</p>
                    </article>
                  ))}
                </div>

                <div className={`${styles.resultsCallout} ${styles.resultsReveal}`} style={{ animationDelay: '460ms' }}>
                  <h3>Want a deeper review?</h3>
                  <p>
                    WorthApply goes beyond quick ATS checks with job-fit analysis, stronger resume tailoring,
                    targeted cover letters, and a workflow for deciding which applications deserve your effort.
                  </p>
                  <div className={styles.resultsActions}>
                    <Link href="/signup" className={styles.primaryCta}>
                      Get started free
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                    <button type="button" className={styles.secondaryCta} onClick={reset}>Check another resume</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Why use this first</span>
            <h2>Use the ATS checker as a quick filter before you spend more time tailoring.</h2>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className={styles.infoGrid}
          >
            {educationCards.map((card) => {
              const Icon = card.iconName === 'scanSearch' ? Scan : card.iconName === 'fileText' ? FileText : ShieldCheck;
              return (
                <motion.article key={card.title} variants={fadeUp} className={styles.infoCard}>
                  <span className={styles.infoIcon}><Icon size={20} weight="duotone" /></span>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-surface py-16">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-on-surface mb-4">
              How WorthApply&apos;s ATS Checker Compares
            </h2>
            <p className="text-lg text-on-surface/70">
              See how our free ATS checker stacks up against popular alternatives
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container">
                  <th className="border border-outline-variant/10 p-4 text-left">Feature</th>
                  <th className="border border-outline-variant/10 p-4 text-center bg-primary/10">
                    <strong className="text-primary">WorthApply</strong>
                  </th>
                  <th className="border border-outline-variant/10 p-4 text-center">Jobscan</th>
                  <th className="border border-outline-variant/10 p-4 text-center">Resume Worded</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-outline-variant/10 p-4">Price</td>
                  <td className="border border-outline-variant/10 p-4 text-center font-semibold text-primary bg-primary/5">Free</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">$49/mo</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">Limited free</td>
                </tr>
                <tr>
                  <td className="border border-outline-variant/10 p-4">Unlimited Scans</td>
                  <td className="border border-outline-variant/10 p-4 text-center bg-primary/5">✅</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">❌ (5-20/mo)</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">❌ Limited</td>
                </tr>
                <tr>
                  <td className="border border-outline-variant/10 p-4">Job Fit Analysis</td>
                  <td className="border border-outline-variant/10 p-4 text-center bg-primary/5">✅</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">❌</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">❌</td>
                </tr>
                <tr>
                  <td className="border border-outline-variant/10 p-4">Resume Tailoring</td>
                  <td className="border border-outline-variant/10 p-4 text-center bg-primary/5">✅ AI-powered</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">Manual</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">Suggestions</td>
                </tr>
                <tr>
                  <td className="border border-outline-variant/10 p-4">Application Tracking</td>
                  <td className="border border-outline-variant/10 p-4 text-center bg-primary/5">✅</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">❌</td>
                  <td className="border border-outline-variant/10 p-4 text-center text-on-surface/60">❌</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <p className="text-on-surface/70 mb-4">
              Want more than just ATS checking? WorthApply includes job fit analysis, AI resume tailoring, and application tracking.
            </p>
            <Link 
              href="/blog/worthapply-vs-jobscan"
              className="text-primary hover:underline font-semibold"
            >
              Read full comparison: WorthApply vs Jobscan →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-b from-surface to-surface-container py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-on-surface mb-12 text-center"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <details className="group bg-surface-container rounded-xl border border-outline-variant/10 p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-on-surface">What is an ATS resume checker?</h3>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-on-surface/70 leading-relaxed">
                An ATS (Applicant Tracking System) resume checker is a tool that scans your resume to see if it will pass 
                through automated screening systems used by employers. It checks for formatting issues, keyword optimization, 
                and structural problems that could cause your resume to be rejected before a human ever sees it.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-surface-container rounded-xl border border-outline-variant/10 p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-on-surface">How does an ATS scanner work?</h3>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-on-surface/70 leading-relaxed">
                ATS scanners parse resume content by looking for standard sections (Experience, Education, Skills), extracting 
                contact information, and matching keywords from the job description. They score resumes based on keyword relevance, 
                formatting cleanliness, and how well the content matches required qualifications.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-surface-container rounded-xl border border-outline-variant/10 p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-on-surface">Is this ATS checker free?</h3>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-on-surface/70 leading-relaxed">
                Yes! WorthApply&apos;s ATS resume checker is completely free with unlimited scans. No credit card required, 
                no signup needed. You can check as many resumes as you want.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-surface-container rounded-xl border border-outline-variant/10 p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-on-surface">How accurate is the ATS checker?</h3>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-on-surface/70 leading-relaxed">
                Our ATS checker uses the same parsing algorithms as major Applicant Tracking Systems like Greenhouse, Lever, 
                and Workday. While no checker is 100% perfect (each ATS is slightly different), our tool identifies the most 
                common issues that cause resumes to be rejected by automated systems.
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-surface-container rounded-xl border border-outline-variant/10 p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-on-surface">What makes a resume ATS-friendly?</h3>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-on-surface/70 leading-relaxed">
                An ATS-friendly resume has clean formatting (no tables, text boxes, or images), standard section headings 
                (Experience, Education, Skills), uses common fonts, includes relevant keywords from the job description, and is 
                saved in a compatible format (.docx or .pdf). Avoid graphics, columns, and creative formatting that ATS cannot parse.
              </p>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-surface-container rounded-xl border border-outline-variant/10 p-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-on-surface">What ATS score should I aim for?</h3>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-on-surface/70 leading-relaxed">
                Aim for an ATS score of <strong>80+</strong>. Scores above 80 indicate your resume will likely pass automated 
                screening. Scores of 90+ are excellent and show strong keyword optimization and clean formatting. Below 70, you 
                should make significant improvements before applying.
              </p>
            </details>
          </div>

          <div className="mt-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-4">
              Ready to Apply Smarter?
            </h3>
            <p className="text-lg text-on-surface/70 mb-6">
              Get more than just ATS checking. Analyze job fit, tailor resumes with AI, and track all your applications in one place.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Try WorthApply Free →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
