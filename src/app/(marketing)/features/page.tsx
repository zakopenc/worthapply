import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  SealCheck,
  Briefcase,
  ClipboardText,
  Scan,
  Sparkle,
  Target,
} from '@/components/ui/phosphor-icons';
import styles from './features.module.css';
import { AnimatedStats } from './AnimatedStats';
import { UserJourney } from './UserJourney';
import { FeaturesShowcase } from './FeaturesShowcase';
import { StaggerGroup, FadeUp, RevealOnScroll } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Features — Job Fit Analysis, Resume Tailoring & Application Tracking',
  description:
    'Analyze job fit in seconds, tailor your resume with real evidence, and track every application in one place. The only tool that tells you whether to apply before you start tailoring.',
  alternates: {
    canonical: 'https://www.worthapply.com/features',
  },
};

const features = [
  {
    title: 'Job-fit analysis',
    text: 'See alignment, gaps, and friction points before you invest time in any role.',
    points: ['Instant fit verdict', 'Requirement-level breakdown', 'Smarter effort decisions'],
    iconName: 'target',
  },
  {
    title: 'ATS review',
    text: 'Catch missing keywords, weak signals, and formatting risks before the robots do.',
    points: ['Keyword coverage map', 'Formatting validation', 'Actionable fix list'],
    iconName: 'scanSearch',
  },
  {
    title: 'Resume tailoring',
    text: 'Sharper bullets, tighter summaries — grounded in your actual experience.',
    points: ['Role-specific edits', 'Human-sounding output', 'Evidence-backed claims'],
    iconName: 'sparkles',
  },
  {
    title: 'Application tracking',
    text: 'One dashboard for every application, status, and follow-up.',
    points: ['Pipeline stage tracking', 'Match scores at a glance', 'Follow-up reminders'],
    iconName: 'clipboardCheck',
  },
  {
    title: 'Strategic workflow',
    text: 'A filter for effort, not just a document generator.',
    points: ['Skip low-fit roles', 'Focus on strong matches', 'Apply with confidence'],
    iconName: 'briefcaseBusiness',
  },
];

const workflow = [
  'Analyze the role before you start rewriting your resume',
  'Tailor your resume with better evidence and stronger language',
  'Generate a targeted cover letter from the same context',
  'Move the role into a cleaner application pipeline',
];

export default function FeaturesPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Product features</span>
          <h1>A fit-first platform for<br />smarter applications</h1>
          <p>
            Analyze job fit in seconds, tailor your resume with real evidence, and track every application in one place. Built for selective applicants &mdash; not spray-and-pray volume.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <StaggerGroup className={styles.grid}>
            {features.map((feature) => {
              const Icon = feature.iconName === 'target' ? Target : feature.iconName === 'scanSearch' ? Scan : feature.iconName === 'sparkles' ? Sparkle : feature.iconName === 'clipboardCheck' ? ClipboardText : Briefcase;
              return (
                <FadeUp key={feature.title}>
                  <article className={styles.card}>
                    <span className={styles.iconWrap}><Icon size={20} weight="duotone" /></span>
                    <h2>{feature.title}</h2>
                    <p>{feature.text}</p>
                    <ul>
                      {feature.points.map((point) => (
                        <li key={point}>
                          <SealCheck size={16} weight="fill" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </FadeUp>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Visual Feature Showcase */}
      <section className={styles.showcase}>
        <FeaturesShowcase />
      </section>

      {/* Stats Section with Premium Animations */}
      <AnimatedStats />
      
      {/* User Journey Timeline */}
      <UserJourney />

      <section className={styles.sectionAlt}>
        <RevealOnScroll className={styles.container}>
          <div className={styles.summaryPanel}>
            <div>
              <span className={styles.sectionEyebrow}>Complete job search platform</span>
              <h2>One platform. Every step covered.</h2>
              <p>
                From fit analysis to final application — WorthApply replaces the spreadsheet, the ATS scanner, and the generic rewriter with one focused workflow.
              </p>
            </div>
            <div className={styles.principlesList}>
              {workflow.map((item) => (
                <div key={item} className={styles.principleItem}>
                  <SealCheck size={18} weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/signup" className={styles.primaryCta}>
              Get started free
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link href="/pricing" className={styles.secondaryCta}>
              View pricing
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
