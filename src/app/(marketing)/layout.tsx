import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ShieldCheck } from '@/components/ui/phosphor-icons';
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
              Run your first fit analysis free. See if a role is worth your time before you change a single line on your
              resume.
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
              Professional job search workspace — fit verdicts, evidence-based edits, and pipeline visibility in one place.
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
