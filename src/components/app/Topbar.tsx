'use client';

import Link from 'next/link';
import { ArrowUpRight, Bell, Sparkles, UserCircle2 } from 'lucide-react';
import styles from './Topbar.module.css';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export default function Topbar({ title, breadcrumb }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.intro}>
        <span className={styles.breadcrumb}>{breadcrumb || `Workspace / ${title}`}</span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.liveBadge}>
            <Sparkles size={14} />
            Focus mode
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.utilityCard}>
          <span className={styles.utilityLabel}>Next best move</span>
          <span className={styles.utilityText}>Keep your job search organized and momentum high.</span>
        </div>

        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.notifDot} />
        </button>

        <Link href="/settings" className={styles.profileButton} aria-label="Open settings">
          <UserCircle2 size={18} />
          <span>Account</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </header>
  );
}
