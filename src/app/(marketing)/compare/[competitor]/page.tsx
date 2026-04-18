import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle, X, Scan, Sparkle, Target } from '@/components/ui/phosphor-icons';
import { RevealOnScroll, StaggerGroup, FadeUp } from '@/components/ui/motion';
import styles from '../compare.module.css';

type CompetitorKey = 'jobscan' | 'teal' | 'rezi';

interface CompetitorData {
  name: string;
  price: string;
  tagline: string;
  contextBlurb: string;
  features: {
    feature: string;
    worthapply: string | boolean;
    competitor: string | boolean;
  }[];
  whyPoints: {
    title: string;
    desc: string;
    icon: 'target' | 'scan' | 'sparkles';
  }[];
}

const competitors: Record<CompetitorKey, CompetitorData> = {
  jobscan: {
    name: 'Jobscan',
    price: '$49.95/mo',
    tagline: 'Jobscan is strong on ATS matching. WorthApply adds broader decision support, tailoring, and workflow coverage.',
    contextBlurb:
      'Jobscan focuses heavily on ATS matching. WorthApply goes further by helping you assess role fit, improve resume alignment, and decide where your effort is most likely to pay off.',
    features: [
      { feature: 'Price', worthapply: '$29/mo', competitor: '$49.95/mo' },
      { feature: 'Job-fit analysis', worthapply: true, competitor: false },
      { feature: 'ATS checks', worthapply: true, competitor: true },
      { feature: 'Evidence-backed tailoring', worthapply: true, competitor: 'Limited' },
      { feature: 'Application tracking', worthapply: true, competitor: 'Basic' },
      { feature: 'Before/after scoring', worthapply: true, competitor: true },
    ],
    whyPoints: [
      {
        title: 'Broader than ATS scanning',
        desc: 'WorthApply helps you evaluate whether a role is worth pursuing before you spend time rewriting your resume.',
        icon: 'target',
      },
      {
        title: 'Stronger tailoring story',
        desc: 'You get ATS guidance plus evidence-backed rewrites that stay grounded in your real experience and still sound human.',
        icon: 'sparkles',
      },
      {
        title: 'More complete application flow',
        desc: 'Tracking and prioritization make the product feel more useful than a single-purpose checker.',
        icon: 'scan',
      },
    ],
  },
  teal: {
    name: 'Teal',
    price: '$29/mo',
    tagline: 'Teal is excellent at organization. WorthApply differentiates with deeper fit analysis and stronger tailoring intelligence.',
    contextBlurb:
      'Teal is known for polished job tracking and career organization. WorthApply adds deeper fit analysis and clearer resume-to-job matching so you can prioritize with more confidence.',
    features: [
      { feature: 'Price', worthapply: '$29/mo', competitor: '$29/mo' },
      { feature: 'Job-fit analysis', worthapply: true, competitor: false },
      { feature: 'ATS checks', worthapply: true, competitor: 'Partial' },
      { feature: 'Evidence-backed tailoring', worthapply: true, competitor: 'Limited' },
      { feature: 'Application tracking', worthapply: true, competitor: true },
      { feature: 'Before/after scoring', worthapply: true, competitor: false },
    ],
    whyPoints: [
      {
        title: 'More diagnostic value',
        desc: 'WorthApply helps you understand fit gaps, skill alignment, and role quality instead of only organizing the search.',
        icon: 'target',
      },
      {
        title: 'ATS signal is clearer',
        desc: 'The workflow makes ATS optimization and tailoring visible at the same time instead of hiding them behind separate tools.',
        icon: 'scan',
      },
      {
        title: 'Professional middle ground',
        desc: 'WorthApply combines decision support with tailored guidance, sitting between tracker-first tools and generic AI writers.',
        icon: 'sparkles',
      },
    ],
  },
  rezi: {
    name: 'Rezi',
    price: '$29/mo',
    tagline: 'Rezi is template and resume-builder oriented. WorthApply owns more of the strategy layer around matching and prioritization.',
    contextBlurb:
      'Rezi focuses on resume building and templates. WorthApply adds a stronger decision layer by helping you judge role fit first, then improve the application with more targeted guidance.',
    features: [
      { feature: 'Price', worthapply: '$29/mo', competitor: '$29/mo' },
      { feature: 'Job-fit analysis', worthapply: true, competitor: false },
      { feature: 'ATS checks', worthapply: true, competitor: true },
      { feature: 'Evidence-backed tailoring', worthapply: true, competitor: 'Template-led' },
      { feature: 'Application tracking', worthapply: true, competitor: false },
      { feature: 'Before/after scoring', worthapply: true, competitor: false },
    ],
    whyPoints: [
      {
        title: 'Beyond resume building',
        desc: 'WorthApply helps you make better application decisions instead of only generating resume content.',
        icon: 'target',
      },
      {
        title: 'Sharper workflow continuity',
        desc: 'Evaluation, tailoring, and tracking in one product increases perceived depth and usefulness.',
        icon: 'scan',
      },
      {
        title: 'Grounded output',
        desc: 'Evidence-backed edits provide a more credible result than template-first or purely generative resume tools.',
        icon: 'sparkles',
      },
    ],
  },
};

export function generateStaticParams() {
  return [{ competitor: 'jobscan' }, { competitor: 'teal' }, { competitor: 'rezi' }];
}

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const { competitor } = await params;
  const data = competitors[competitor as CompetitorKey];
  if (!data) return {};

  return {
    title: `WorthApply vs ${data.name}`,
    description: `Compare WorthApply and ${data.name} across ATS support, resume tailoring, job-fit analysis, and pricing.`,
    alternates: {
      canonical: `https://worthapply.com/compare/${competitor}`,
    },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params;
  const data = competitors[competitor as CompetitorKey];
  if (!data) notFound();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Comparison</span>
          <h1>WorthApply vs {data.name}</h1>
          <p>{data.tagline}</p>
        </div>
      </section>

      <section className={styles.section}>
        <StaggerGroup className={styles.container}>
          <FadeUp>
          <div className={styles.summaryPanel}>
            <div>
              <span className={styles.sectionEyebrow}>Quick context</span>
              <h2>How WorthApply compares with {data.name}</h2>
              <p>{data.contextBlurb}</p>
            </div>
            <div className={styles.summaryStats}>
              <div>
                <span>WorthApply</span>
                <strong>$29/mo</strong>
              </div>
              <div>
                <span>{data.name}</span>
                <strong>{data.price}</strong>
              </div>
            </div>
          </div>
          </FadeUp>

          <FadeUp>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>WorthApply</th>
                  <th>{data.name}</th>
                </tr>
              </thead>
              <tbody>
                {data.features.map((row) => (
                  <tr key={row.feature}>
                    <td><strong>{row.feature}</strong></td>
                    <td className={styles.highlightCell}><CellDisplay value={row.worthapply} /></td>
                    <td><CellDisplay value={row.competitor} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </FadeUp>
        </StaggerGroup>
      </section>

      <section className={styles.sectionAlt}>
        <RevealOnScroll className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Why it matters</span>
            <h2>Three reasons job seekers may prefer WorthApply over {data.name}</h2>
          </div>

          <StaggerGroup className={styles.cardGrid}>
            {data.whyPoints.map((point) => (
              <FadeUp key={point.title}>
              <article className={styles.card}>
                <span className={styles.iconWrap}>{getIcon(point.icon)}</span>
                <h3>{point.title}</h3>
                <p>{point.desc}</p>
              </article>
              </FadeUp>
            ))}
          </StaggerGroup>
        </RevealOnScroll>
      </section>

      <section className={styles.section}>
        <RevealOnScroll className={styles.container}>
          <div className={styles.bottomPanel}>
            <div>
              <span className={styles.sectionEyebrow}>Next step</span>
              <h2>Compare the workflow, then try WorthApply on your next real application.</h2>
            </div>
            <div className={styles.bottomActions}>
              <Link href="/signup" className={styles.primaryCta}>
                Get started free
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link href="/compare" className={styles.secondaryCta}>
                Back to comparisons
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}

function CellDisplay({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className={styles.booleanPositive}>
        <CheckCircle size={16} weight="fill" />
        Included
      </span>
    );
  }

  if (value === false) {
    return (
      <span className={styles.booleanNegative}>
        <X size={16} weight="bold" />
        No
      </span>
    );
  }

  return <span className={styles.cellText}>{value}</span>;
}

function getIcon(icon: 'target' | 'scan' | 'sparkles') {
  if (icon === 'target') return <Target size={20} weight="duotone" />;
  if (icon === 'scan') return <Scan size={20} weight="duotone" />;
  return <Sparkle size={20} weight="duotone" />;
}
