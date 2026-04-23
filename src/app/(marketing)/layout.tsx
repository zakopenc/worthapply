import Link from 'next/link';
import type { ReactNode } from 'react';
import { ShieldCheck } from '@/components/ui/phosphor-icons';
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
      { label: 'Job Probability Engine', href: '/features' },
      { label: 'Outreach Copilot', href: '/features' },
      { label: 'Interview Prep', href: '/features' },
      { label: 'Application Tracking', href: '/features' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Refund Policy', href: '/legal/refund' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.brandBlock}>
            <div className={styles.brandRow}>
              <span className={styles.brandWordmark}>WorthApply</span>
              <span className={styles.trustPill}>
                <ShieldCheck size={14} weight="duotone" />
                Job Probability Engine &middot; Evidence-based &middot; No fabrication
              </span>
            </div>
            <p>
              The Job Probability Engine — score your interview odds before you apply, then use every tool to improve them.
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
          <p>The Job Probability Engine. Know your interview probability before you apply a single hour.</p>
        </div>
      </footer>
    </>
  );
}
