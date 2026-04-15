import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin/service';
import styles from './layout.module.css';

export const metadata = { title: 'Admin — WorthApply', robots: 'noindex,nofollow' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await verifyAdmin(user.id);
  if (!role) redirect('/dashboard');

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>WorthApply Admin</span>
        <nav className={styles.nav}>
          <a href="/admin" className={styles.navLink}>Users</a>
        </nav>
        <span className={styles.role}>{role}</span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
