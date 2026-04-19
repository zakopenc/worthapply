'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminNav.module.css';

type Props = {
  role: string;
  deployEnv: string;
};

function navClass(active: boolean): string {
  return `${styles.navLink} ${active ? styles.navLinkActive : ''}`.trim();
}

function envClass(env: string): string {
  const e = env.toLowerCase();
  if (e === 'production') return styles.envProduction;
  if (e === 'preview') return styles.envPreview;
  return styles.envDev;
}

export function AdminNav({ role, deployEnv }: Props) {
  const pathname = usePathname() || '';
  const overview = pathname === '/admin';
  const users = pathname.startsWith('/admin/users');
  const ops = pathname.startsWith('/admin/ops');
  const trust = pathname.startsWith('/admin/trust');

  return (
    <nav className={styles.navInner} aria-label="Admin primary">
      <div className={styles.brand}>
        <span className={styles.brandTitle}>WorthApply</span>
        <span className={styles.brandSub}>Admin</span>
      </div>
      <div className={styles.links}>
        <Link href="/admin" className={navClass(overview)}>
          Overview
        </Link>
        <Link href="/admin/users" className={navClass(users)}>
          Users
        </Link>
        <Link href="/admin/ops" className={navClass(ops)}>
          Ops
        </Link>
        <Link href="/admin/trust" className={navClass(trust)}>
          Trust
        </Link>
      </div>
      <div className={styles.right}>
        <span className={`${styles.envBadge} ${envClass(deployEnv)}`} title="Deployment environment">
          {deployEnv}
        </span>
        <span className={styles.role}>{role}</span>
        <Link href="/dashboard" className={styles.appLink}>
          App →
        </Link>
      </div>
    </nav>
  );
}
