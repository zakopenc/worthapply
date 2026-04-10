import type { Metadata } from 'next';
import { SealCheck, ShieldCheck, Sparkle, Target } from '@/components/ui/phosphor-icons';
import { StaggerGroup, FadeUp, RevealOnScroll, GradientCard } from '@/components/ui/motion';
import styles from './about.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About | WorthApply',
  description:
    'Learn how WorthApply helps job seekers make better application decisions with fit analysis, ATS clarity, tailored resumes, and cleaner workflow management.',
  alternates: {
    canonical: 'https://worthapply.com/about',
  },
};

const principles = [
  {
    title: 'Strategy over volume',
    text: 'One informed, well-tailored application is usually worth more than ten rushed submissions.',
    iconName: 'target',
  },
  {
    title: 'Grounded recommendations',
    text: 'Suggestions should connect back to your actual experience and the role in front of you.',
    iconName: 'sparkles',
  },
  {
    title: 'Transparent workflow',
    text: 'You should understand why a role looks strong, weak, or risky before you spend time applying.',
    iconName: 'badgeCheck',
  },
  {
    title: 'Respect for candidate data',
    text: 'Career history is personal, so the product should feel trustworthy, clear, and controlled.',
    iconName: 'shieldCheck',
  },
];

const pillars = [
  {
    title: 'Evaluate',
    text: 'See whether a role is worth pursuing through fit analysis, missing-skill visibility, and clearer decision support.',
  },
  {
    title: 'Tailor',
    text: 'Improve ATS alignment and strengthen resume bullets without drifting into generic or inflated AI phrasing.',
  },
  {
    title: 'Track',
    text: 'Keep your application pipeline organized so good opportunities, follow-ups, and next steps do not get lost.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>About WorthApply</span>
          <h1>WorthApply exists to make job searching more strategic, less noisy, and more honest.</h1>
          <p>
            Too many job seekers are forced to choose between generic AI writing tools, narrow ATS
            scanners, and messy spreadsheets. WorthApply is built to bring those workflows together
            in a clearer, more professional experience.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <StaggerGroup className={styles.storyGrid}>
            <FadeUp>
              <div className={styles.storyCard}>
                <span className={styles.sectionEyebrow}>The problem</span>
                <h2>Most applicants waste time before they even know whether a job is a strong fit.</h2>
                <p>
                  They tailor too late, over-apply to weak matches, or rely on tools that optimize for
                  volume instead of probability. WorthApply is built around a better order: evaluate
                  first, tailor second, and apply with more confidence.
                </p>
              </div>
            </FadeUp>

            <FadeUp>
              <div className={styles.storyCardMuted}>
                <span className={styles.sectionEyebrow}>The product idea</span>
                <h2>A focused system for fit analysis, ATS clarity, and evidence-backed tailoring.</h2>
                <div className={styles.pillarList}>
                  {pillars.map((pillar) => (
                    <article key={pillar.title} className={styles.pillarItem}>
                      <strong>{pillar.title}</strong>
                      <p>{pillar.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </FadeUp>
          </StaggerGroup>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <RevealOnScroll>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Principles</span>
              <h2>Product beliefs that shape WorthApply</h2>
              <p>
                WorthApply is built to feel credible, useful, and grounded in real application outcomes
                rather than hype or empty AI claims.
              </p>
            </div>
          </RevealOnScroll>

          <StaggerGroup className={styles.principlesGrid}>
            {principles.map((item) => {
              const Icon = item.iconName === 'target' ? Target : item.iconName === 'sparkles' ? Sparkle : item.iconName === 'badgeCheck' ? SealCheck : ShieldCheck;
              return (
                <FadeUp key={item.title}>
                  <GradientCard glowOnHover>
                    <span className={styles.iconWrap}><Icon size={20} weight="duotone" /></span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </GradientCard>
                </FadeUp>
              );
            })}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}
