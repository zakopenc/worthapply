'use client';

import Link from 'next/link';
import { UserCircle2 } from 'lucide-react';
import styles from './Topbar.module.css';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export default function Topbar({ title, breadcrumb }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <span className={styles.breadcrumb}>{breadcrumb || `Workspace / ${title}`}</span>
      <Link href="/settings" className={styles.accountButton} aria-label="Open settings">
        <UserCircle2 size={15} />
        <span>Account</span>
      </Link>
    </header>
  );
}
