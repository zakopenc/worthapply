import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin/service';
import { AdminNav } from './components/AdminNav';
import styles from './layout.module.css';

export const metadata = { title: 'Admin — WorthApply', robots: 'noindex,nofollow' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await verifyAdmin(user.id);
  if (!role) redirect('/dashboard');

  const deployEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <AdminNav role={role} deployEnv={deployEnv} />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
