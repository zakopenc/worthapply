import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/app/Sidebar';
import styles from './layout.module.css';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan, onboarding_complete, account_status')
    .eq('id', user.id)
    .single();

  if (profile?.account_status === 'suspended') {
    redirect('/suspended');
  }

  // Force first-time users to complete onboarding before accessing the app
  // Onboarding page is outside this layout group, so no redirect loop
  if (!profile?.onboarding_complete) {
    redirect('/onboarding');
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        userName={profile?.full_name ?? user.email?.split('@')[0] ?? null}
        plan={profile?.plan ?? 'free'}
      />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
