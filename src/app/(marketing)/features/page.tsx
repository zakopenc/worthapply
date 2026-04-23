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
  title: 'Features — The Job Probability Engine',
  description:
    'WorthApply scores your interview probability before you apply, then gives you every tool to improve it — tailoring, outreach, interview prep, and offer negotiation.',
  alternates: {
    canonical: 'https://www.worthapply.com/features',
  },
};

const features = [
  {
    title: 'Apply/Skip Decision Engine',
    text: 'Calculate your interview probability across 7 signals before investing a minute in tailoring.',
    points: ['7-signal probability score', 'Gap analysis + ranked fix list', 'Apply/Skip verdict in 10 seconds'],
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
  'Calculate your interview probability — skip roles before rewriting anything',
  'Boost your probability: tailor with stronger evidence and ATS-optimized keywords',
  'Boost your probability: write outreach that gets recruiter responses',
  'Boost your probability: prep with stage-specific questions from your story bank',
  'Boost your probability: evaluate offers and negotiate with 4-year projections',
];

export default function FeaturesPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Job Probability Engine</span>
          <h1>Score your probability.<br />Then improve it.</h1>
          <p>
            WorthApply calculates your interview probability before you apply — then every tool below exists to close the gap, from resume tailoring to offer negotiation.
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
              <span className={styles.sectionEyebrow}>Job Probability Engine</span>
              <h2>One engine. Every stage covered.</h2>
              <p>
                From probability score to signed offer — WorthApply replaces the guesswork, the generic rewriter, and the scattered tools with one focused workflow built around your interview odds.
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
