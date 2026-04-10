'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    setResending(true);
    setError('');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user?.email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email: session.user.email });
      if (error) setError(error.message);
      else setResent(true);
    } else {
      setError('Please sign in again to resend your verification email.');
    }

    setResending(false);
  }

  return (
    <div className={styles.successWrapper}>
      <div className={styles.successIcon}><Mail size={22} /></div>
      <h1 className={styles.successHeading}>Verify your email</h1>
      <p className={styles.successText}>
        We sent you a confirmation email. Open the link inside that message to verify your account and continue to onboarding.
      </p>
      <p className={styles.successText}>
        Didn&apos;t receive it? Check spam first, then request another message below.
      </p>
      {resent && <div className={styles.success}>A fresh verification link has been sent.</div>}
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.secondaryButton} onClick={handleResend} disabled={resending || resent}>
        {resending ? 'Resending…' : resent ? 'Verification sent' : 'Resend verification link'}
        {!resending && !resent && <RefreshCw size={16} />}
      </button>
      <Link href="/login" className={styles.footerLink}>Back to sign in</Link>
      <div className={styles.trustPill}><CheckCircle2 size={16} /> Email verification helps secure your account and restore access later</div>
    </div>
  );
}
