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
  PaperPlaneTilt,
  GraduationCap,
  Archive,
  Handshake,
} from '@/components/ui/phosphor-icons';
import styles from './features.module.css';
import { AnimatedStats } from './AnimatedStats';
import { UserJourney } from './UserJourney';
import { FeaturesShowcase } from './FeaturesShowcase';
import { StaggerGroup, FadeUp, RevealOnScroll } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Features — Job Fit Analysis, Resume Tailoring, Outreach & More',
  description:
    'Analyze job fit in seconds, tailor your resume, write outreach messages, prep for interviews, and evaluate offers — all in one platform. Built for serious job seekers.',
  alternates: {
    canonical: 'https://www.worthapply.com/features',
  },
};

const features = [
  {
    title: 'Apply/Skip Decision Engine',
    text: 'Score your fit across 7 dimensions before investing a single minute. Know which roles are worth your effort.',
    points: ['7-dimension scoring breakdown', 'Gap analysis + what to fix', 'Effort estimate + interview probability'],
    iconName: 'target',
    badge: null,
  },
  {
    title: 'ATS optimization',
    text: 'Catch missing keywords, weak signals, and formatting risks before the robots do.',
    points: ['Keyword coverage map', 'Formatting validation', 'Actionable fix list'],
    iconName: 'scanSearch',
    badge: 'Pro',
  },
  {
    title: 'Resume tailoring',
    text: 'Sharper bullets, tighter summaries — grounded in your actual experience.',
    points: ['Role-specific edits', 'Human-sounding output', 'Evidence-backed claims'],
    iconName: 'sparkles',
    badge: null,
  },
  {
    title: 'Cover letter generator',
    text: 'Role-specific cover letters that reference your real experience, not templates.',
    points: ['Full draft in seconds', 'Built-in editor', 'Grounded in your resume facts'],
    iconName: 'clipboardCheck',
    badge: null,
  },
  {
    title: 'Outreach Copilot',
    text: 'Recruiter messages, referral requests, and LinkedIn notes — all tailored to the role.',
    points: ['Recruiter + referral messages', 'Short LinkedIn note (≤150 chars)', 'Follow-up message included'],
    iconName: 'paperplane',
    badge: 'Pro',
  },
  {
    title: 'Application tracking',
    text: 'One dashboard for every application, status, and follow-up.',
    points: ['Pipeline stage tracking', 'Match scores at a glance', 'Follow-up reminders'],
    iconName: 'briefcaseBusiness',
    badge: null,
  },
  {
    title: 'Interview Prep Copilot',
    text: 'Stage-specific questions with STAR answer outlines built from your evidence bank.',
    points: ['Behavioral + technical questions', 'STAR answer frameworks', 'Risk notes per question'],
    iconName: 'graduation',
    badge: 'Premium',
  },
  {
    title: 'Evidence Vault',
    text: 'AI extracts your achievement story bank from your resume, ready to use everywhere.',
    points: ['7 story categories', 'Tagged by skill + role', 'Powers interview, cover letter, outreach'],
    iconName: 'archive',
    badge: 'Premium',
  },
  {
    title: 'Offer & Negotiation Copilot',
    text: '4-year comp projections, vesting analysis, and negotiation scripts for any offer.',
    points: ['Total comp breakdown', 'Accept/consider/decline verdict', 'Negotiation scripts'],
    iconName: 'handshake',
    badge: 'Premium',
  },
];

const workflow = [
  'Score fit across 7 dimensions — skip roles before rewriting anything',
  'Tailor your resume with stronger evidence and ATS-optimized keywords',
  'Write outreach messages that get recruiter responses',
  'Prep for interviews with stage-specific questions from your story bank',
  'Evaluate offers with 4-year projections and a negotiation script',
];

export default function FeaturesPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Product features</span>
          <h1>Every tool you need<br />to land the right role</h1>
          <p>
            From fit analysis to offer negotiation — WorthApply covers every stage of the job search so you apply smarter, outreach better, and walk into interviews prepared.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <StaggerGroup className={styles.grid}>
            {features.map((feature) => {
              const Icon =
                feature.iconName === 'target' ? Target :
                feature.iconName === 'scanSearch' ? Scan :
                feature.iconName === 'sparkles' ? Sparkle :
                feature.iconName === 'clipboardCheck' ? ClipboardText :
                feature.iconName === 'paperplane' ? PaperPlaneTilt :
                feature.iconName === 'graduation' ? GraduationCap :
                feature.iconName === 'archive' ? Archive :
                feature.iconName === 'handshake' ? Handshake :
                Briefcase;
              const badgeColor =
                feature.badge === 'Pro' ? 'bg-secondary/10 text-secondary' :
                feature.badge === 'Premium' ? 'bg-purple-100 text-purple-700' : null;
              return (
                <FadeUp key={feature.title}>
                  <article className={styles.card}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={styles.iconWrap}><Icon size={20} weight="duotone" /></span>
                      {feature.badge && badgeColor && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {feature.badge}
                        </span>
                      )}
                    </div>
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
                From fit analysis to offer negotiation — WorthApply replaces the spreadsheet, the ATS scanner, the generic rewriter, and the guesswork with one focused workflow.
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
