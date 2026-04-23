import type { Metadata } from 'next';
import { FadeUp, RevealOnScroll } from '@/components/ui/motion';
import PartnersClient from './PartnersClient';
import styles from './partners.module.css';

export const metadata: Metadata = {
  title: 'Partner Program | WorthApply for Career Coaches',
  description:
    'Give your clients a sharper edge before every application. WorthApply shows ATS match scores and keyword gaps in 10 seconds. Free for coaches and their clients during pre-launch beta.',
  alternates: {
    canonical: 'https://worthapply.com/partners',
  },
  openGraph: {
    title: 'WorthApply for Career Coaches — Partner Program',
    description:
      'Share a free tool that shows clients their ATS fit score in 10 seconds. Get your personal referral link and a free Pro account.',
    url: 'https://worthapply.com/partners',
  },
};

const stats = [
  { number: '75%', label: 'of resumes filtered by ATS before a human reads them' },
  { number: '10 sec', label: 'to see a full ATS fit score and keyword gap report' },
  { number: '$0', label: 'cost to your clients via your referral link' },
];

const steps = [
  {
    n: '1',
    title: 'Get your personal referral link',
    body: "Fill out the form below and we'll send you a unique link tied to your name within 24 hours.",
    example: 'worthapply.com/?ref=jane-smith',
  },
  {
    n: '2',
    title: "Share it when it's relevant",
    body: 'Drop it in your intake packet, session notes, email signature, or Linktree. Works especially well the moment a client is about to apply to a new role.',
  },
  {
    n: '3',
    title: 'Your clients get free Pro access',
    body: 'Anyone who signs up through your link gets free Pro access during our pre-launch beta — no credit card required. You get a free Pro account to test it yourself first.',
  },
];

const benefits = [
  {
    icon: '🔗',
    title: 'Your own referral link',
    body: 'A personalized URL that tracks every client you send.',
  },
  {
    icon: '✨',
    title: 'Free Pro account for you',
    body: 'Try every feature before recommending it. See exactly what your clients experience.',
  },
  {
    icon: '🎯',
    title: 'Free Pro for all your clients',
    body: 'No friction, no barrier. Everyone who joins through your link gets full access during beta.',
  },
  {
    icon: '📣',
    title: 'Direct line to the product team',
    body: "Pre-launch partners shape the roadmap. Your feedback — and your clients' — gets acted on fast.",
  },
];

const toolFeatures = [
  'ATS match score for any role in ~10 seconds',
  'Exact keywords missing from the resume',
  'Evidence-based resume tailoring suggestions — no fabrication',
  'Cover letter generation tuned to the specific role',
  'Application tracking dashboard',
];

const audiences = [
  {
    tag: 'Outplacement firms',
    body: 'Give recently laid-off clients a concrete tool for their first 30 days of searching. Maximize application quality immediately.',
  },
  {
    tag: 'Independent career coaches',
    body: "Add a 10-second fit check to your intake process. Stop clients from spending hours on roles they'll never clear ATS.",
  },
  {
    tag: 'Executive coaches',
    body: 'Senior-level keyword nuances matter more — even slight mismatches in titles and skills cause ATS rejection at VP+ level.',
  },
  {
    tag: 'University career centers',
    body: 'Help students understand fit before they apply. Great for campus recruiting season and high-volume application periods.',
  },
];

const faqs = [
  {
    q: 'Is there a cost to join the partner program?',
    a: 'No. The program is completely free. You get a free Pro account and your clients get free Pro access through your link. No credit card, no contract.',
  },
  {
    q: 'How long does free access last for my clients?',
    a: "Through the pre-launch beta period. We'll give you advance notice before any pricing changes, and clients who signed up through your link will always be grandfathered into a preferred rate.",
  },
  {
    q: 'Do you offer a revenue share or commission?',
    a: "Not currently — the partner program is focused on mutual value during beta. We're building toward an affiliate program and will offer early partners the best terms when it launches.",
  },
  {
    q: 'Can I see how many clients have signed up through my link?',
    a: "Basic referral tracking is on our roadmap. In the meantime, reach out to info@worthapply.com and we'll share stats manually.",
  },
  {
    q: 'What if my clients have feedback or run into issues?',
    a: 'Direct them to worthapply.com/support. We respond fast — this is pre-launch and every piece of feedback shapes the product.',
  },
];

export default function PartnersPage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.heroInner}>
          <FadeUp>
            <span className={styles.heroBadge}>Partner Program — Pre-launch Beta</span>
            <h1 className={styles.heroH1}>
              Give your clients a{' '}
              <span className={styles.heroAccent}>sharper edge</span>{' '}
              before every application
            </h1>
            <p className={styles.heroSub}>
              WorthApply shows job seekers their ATS match score and exact keyword gaps in
              10 seconds — before they spend hours on the wrong role. Share it with your
              clients. It&apos;s free.
            </p>
            <div className={styles.heroCtas}>
              <a href="#get-link" className={styles.btnPrimary}>Get your referral link</a>
              <a href="#how-it-works" className={styles.btnGhost}>See how it works</a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* STAT BAR */}
      <div className={styles.statBar}>
        {stats.map((s) => (
          <div key={s.number} className={styles.statItem}>
            <span className={styles.statNumber}>{s.number}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section className={styles.section} id="how-it-works">
        <div className={styles.container}>
          <RevealOnScroll>
            <div className={styles.centered}>
              <span className={styles.eyebrow}>How it works</span>
              <h2 className={styles.sectionTitle}>Three steps. Zero friction.</h2>
              <p className={styles.sectionSub}>
                No pitch decks, no onboarding calls. Just a link you share when it&apos;s relevant.
              </p>
            </div>
            <div className={styles.stepsGrid}>
              {steps.map((step) => (
                <div key={step.n} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.n}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  {step.example && (
                    <div className={styles.refExample}>{step.example}</div>
                  )}
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <RevealOnScroll>
            <span className={styles.eyebrow}>Partner benefits</span>
            <h2 className={styles.sectionTitle}>What you get as a partner</h2>
            <div className={styles.benefitsGrid}>
              {benefits.map((b) => (
                <div key={b.title} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>{b.icon}</div>
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* TOOL SHOWCASE */}
      <section className={styles.showcase}>
        <div className={styles.showcaseInner}>
          <RevealOnScroll>
            <div className={styles.showcaseText}>
              <span className={styles.eyebrowLight}>The product</span>
              <h2 className={styles.showcaseTitle}>What your clients actually see</h2>
              <p className={styles.showcaseSub}>
                Paste a job description, upload a resume, get a fit score and keyword gap
                analysis in seconds. No fluff — just signal.
              </p>
              <ul className={styles.featureList}>
                {toolFeatures.map((f) => (
                  <li key={f}>
                    <span className={styles.check} aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>

          {/* Mock score card */}
          <div className={styles.scoreCard} aria-hidden="true">
            <div className={styles.scoreHeader}>Fit analysis</div>
            <div className={styles.scoreRole}>Senior Product Manager — Stripe</div>
            <div className={styles.scoreRingRow}>
              <div className={styles.scoreRing}>
                <span>84</span>
              </div>
              <div className={styles.scoreDesc}>
                <strong>Strong match</strong>
                Your experience aligns well with this role. 3 keyword gaps to close.
              </div>
            </div>
            <div className={styles.gapsLabel}>Missing keywords</div>
            <div className={styles.pillRow}>
              <span className={`${styles.pill} ${styles.pillMissing}`}>payments infrastructure</span>
              <span className={`${styles.pill} ${styles.pillMissing}`}>go-to-market</span>
              <span className={`${styles.pill} ${styles.pillMissing}`}>API monetization</span>
              <span className={styles.pill}>cross-functional</span>
              <span className={styles.pill}>roadmap</span>
              <span className={styles.pill}>OKRs</span>
            </div>
            <div className={styles.timeBadge}>Analysis completed in 9 seconds</div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className={styles.section}>
        <div className={styles.container}>
          <RevealOnScroll>
            <div className={styles.centered}>
              <span className={styles.eyebrow}>Who this is for</span>
              <h2 className={styles.sectionTitle}>Built for coaches who take outcomes seriously</h2>
              <p className={styles.sectionSub}>
                If your clients are applying to competitive roles and struggling to get responses,
                WorthApply is worth passing along.
              </p>
            </div>
            <div className={styles.audienceGrid}>
              {audiences.map((a) => (
                <div key={a.tag} className={styles.audienceCard}>
                  <div className={styles.audienceTag}>{a.tag}</div>
                  <p>{a.body}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* FORM */}
      <section className={styles.formSection} id="get-link">
        <div className={styles.formInner}>
          <FadeUp>
            <span className={styles.eyebrow}>Ready to partner?</span>
            <h2 className={styles.sectionTitle}>Get your referral link</h2>
            <p className={styles.formIntro}>
              Fill this out and we&apos;ll send your personalized link within 24 hours, along with a
              free Pro account to test WorthApply yourself.
            </p>
          </FadeUp>
          <FadeUp>
            <PartnersClient />
          </FadeUp>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <RevealOnScroll>
            <div className={styles.centered}>
              <span className={styles.eyebrow}>FAQ</span>
              <h2 className={styles.sectionTitle}>Common questions</h2>
            </div>
            <div className={styles.faqList}>
              {faqs.map((f) => (
                <div key={f.q} className={styles.faqItem}>
                  <h4>{f.q}</h4>
                  <p>{f.a}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
