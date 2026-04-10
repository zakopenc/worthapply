'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className={styles.successWrapper}>
        <div className={styles.successIcon}><CheckCircle2 size={22} /></div>
        <h1 className={styles.successHeading}>Check your email</h1>
        <p className={styles.successText}>
          We sent a password reset link to {email}. Open the link in that message to choose a new password for your account.
        </p>
        <Link href="/login" className={styles.secondaryButton}>Back to sign in</Link>
      </div>
    );
  }

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Password reset</span>
        <h1 className={styles.heading}>Reset your password</h1>
        <p className={styles.subtitle}>
          Enter the email tied to your account and we&apos;ll send you a secure reset link.
        </p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input id="email" type="email" className={styles.input} placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          <span>{loading ? 'Sending reset link…' : 'Send reset link'}</span>
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className={styles.trustRow}>
        <div className={styles.trustPill}><Mail size={16} /> Reset emails are sent only to the address linked to your account</div>
      </div>

      <p className={styles.footer}>
        Remembered your password? <Link href="/login" className={styles.footerLink}>Sign in</Link>
      </p>
    </>
  );
}
