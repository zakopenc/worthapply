'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, FileSearch, FileText, LayoutDashboard, NotebookPen, ReceiptText, Settings, Sparkles, Target, WandSparkles } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  userName: string | null;
  plan: string;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyzer', label: 'Job fit analyzer', icon: Target },
  { href: '/resume', label: 'Resume & evidence', icon: FileText },
  { href: '/tailor', label: 'Resume tailoring', icon: WandSparkles },
  { href: '/cover-letter', label: 'Cover letter builder', icon: NotebookPen },
  { href: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { href: '/tracker', label: 'Pipeline tracker', icon: FileSearch },
  { href: '/digest', label: 'Daily digest', icon: ReceiptText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ userName, plan }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.chrome}>
        <Link href="/dashboard" className={styles.brand} aria-label="WorthApply dashboard home">
          <span className={styles.logoMark}>
            <Image 
              src="/logo.svg" 
              alt="WorthApply" 
              width={160} 
              height={40} 
              priority 
              className={styles.logoImage}
            />
          </span>
        </Link>

        <div className={styles.userCard}>
          <span className={styles.userEyebrow}>Signed in as</span>
          <span className={styles.userName}>{userName || 'WorthApply user'}</span>
          <span className={styles.planBadge}>{plan === 'pro' ? 'Pro workspace' : 'Free workspace'}</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
                <span className={styles.navIconWrap}>
                  <Icon size={18} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.footerCard}>
        <div className={styles.footerCardInner}>
          <span className={styles.footerEyebrow}>Recommended workflow</span>
          <strong>Analyze the role, tailor your materials, then track momentum.</strong>
          <p>WorthApply works best when every application has a clear fit score, evidence-backed resume, and next step.</p>
          <Link href="/analyzer" className={styles.footerLink}>
            <Sparkles size={16} /> Start a new analysis
          </Link>
        </div>
      </div>
    </aside>
  );
}
