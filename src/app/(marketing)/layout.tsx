import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, SealCheck, FileMagnifyingGlass, ShieldCheck, Sparkle } from '@/components/ui/phosphor-icons';
import MarketingNav from '@/components/marketing/MarketingNav';
import styles from './layout.module.css';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Compare', href: '/compare' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    title: 'Workflows',
    links: [
      { label: 'Job-fit analysis', href: '/features' },
      { label: 'Resume tailoring', href: '/features' },
      { label: 'ATS checker', href: '/tools/ats-checker' },
      { label: 'Application tracking', href: '/features' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Refund Policy', href: '/legal/refund' },
      { label: 'Contact', href: 'mailto:hello@worthapply.com' },
    ],
  },
];

const highlights = [
  {
    title: 'Smart Job Analysis',
    text: 'Know which jobs are worth your time with instant fit scoring and skill matching.',
    iconName: 'fileSearch',
  },
  {
    title: 'Resume Tailoring',
    text: 'Tailor your resume for each job in seconds with intelligent optimization.',
    iconName: 'sparkles',
  },
  {
    title: 'Application Tracking',
    text: 'Track every application, interview, and follow-up in one organized place.',
    iconName: 'badgeCheck',
  },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerIntro}>
            <span className={styles.badge}>WorthApply</span>
            <h2>Ready to know before you apply?</h2>
            <p>
              Run your first fit analysis free. Evidence-based, no fabrication — an honest read on whether the role is worth your time before you tailor a single bullet.
            </p>
            <div className={styles.footerActions}>
              <Link href="/signup" className={styles.primaryCta}>
                Get started free
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link href="/pricing" className={styles.secondaryCta}>
                View pricing
              </Link>
            </div>
          </div>

          <div className={styles.highlightGrid}>
            {highlights.map((item) => {
              const Icon = item.iconName === 'fileSearch' ? FileMagnifyingGlass : item.iconName === 'sparkles' ? Sparkle : SealCheck;
              return (
                <div key={item.title} className={styles.highlightCard}>
                  <span className={styles.highlightIcon}>
                    <Icon size={18} weight="duotone" />
                  </span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footerMain}>
          <div className={styles.brandBlock}>
            <div className={styles.brandRow}>
              <span className={styles.brandWordmark}>WorthApply</span>
              <span className={styles.trustPill}>
                <ShieldCheck size={14} weight="duotone" />
                Fit-first &middot; Evidence-based &middot; No fabrication
              </span>
            </div>
            <p>
              Professional job application platform. Analyze fit, tailor resumes, and track applications all in one place.
            </p>
          </div>

          <div className={styles.linkGrid}>
            {footerColumns.map((column) => (
              <div key={column.title} className={styles.linkColumn}>
                <span>{column.title}</span>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} WorthApply. All rights reserved.</p>
          <p>Fit-first job search platform. Know if you&apos;re the right fit before you apply.</p>
        </div>
      </footer>
    </>
  );
}
