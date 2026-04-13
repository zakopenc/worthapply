import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './layout.module.css';

export const metadata = {
  title: 'WorthApply — Account',
  description: 'Sign in, create your account, or manage secure access to WorthApply.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shell}>
        <div className={styles.brandPanel}>
          <Link href="/" className={styles.logo} aria-label="WorthApply home">
            <span className={styles.logoMark}>
              <Image src="/logo.png" alt="WorthApply" width={176} height={96} priority />
            </span>
          </Link>

          <div className={styles.brandContent}>
            <span className={styles.kicker}>Secure account access</span>
            <h1>Use WorthApply to evaluate fit, tailor smarter, and keep your applications organized.</h1>
            <p>
              Sign in to continue your workflow, or create a free account to start with ATS-aware
              resume support and application tracking.
            </p>
            <ul className={styles.points}>
              <li>Google sign-in and email/password access</li>
              <li>Private account workspace for your applications and resume data</li>
              <li>Upgrade only when you need unlimited analyses and tailoring</li>
            </ul>
          </div>
        </div>

        <main className={styles.card}>
          <div className={styles.cardInner}>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-on-surface-variant">Loading...</p>
                </div>
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </main>
      </div>

      <footer className={styles.globalFooter}>
        <span>© 2026 WorthApply</span>
        <div className={styles.footerLinks}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:hello@worthapply.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}
