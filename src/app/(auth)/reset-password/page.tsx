'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Your new password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess('Password updated successfully. Redirecting you to sign in…');
    setLoading(false);
    setTimeout(() => router.push('/login'), 1200);
  }

  return (
    <>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>New password</span>
        <h1 className={styles.heading}>Choose a new password</h1>
        <p className={styles.subtitle}>Set a new password to regain access to your WorthApply account.</p>
      </header>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <div className={styles.fieldRow}>
            <label htmlFor="password" className={styles.label}>New password</label>
            <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input id="password" type={showPassword ? 'text' : 'password'} className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a secure password" required minLength={8} />
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
          <input id="confirmPassword" type={showPassword ? 'text' : 'password'} className={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your new password" required minLength={8} />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          <span>{loading ? 'Updating password…' : 'Update password'}</span>
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className={styles.trustRow}>
        <div className={styles.trustPill}><CheckCircle2 size={16} /> Once updated, you can sign in immediately with your new password</div>
      </div>

      <p className={styles.footer}>
        Need to start over? <Link href="/forgot-password" className={styles.footerLink}>Request a new reset link</Link>
      </p>
    </>
  );
}
