'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  // Show error from URL params (from auth callback)
  useState(() => {
    if (errorParam) {
      setError(errorParam);
    }
  });

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Successful login - redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      // Use production URL for OAuth redirect
      const redirectOrigin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Grid Overlay Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #cfc5bd 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.15,
        }}
      ></div>

      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-surface-container-low rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-secondary-container rounded-full blur-[100px] opacity-10"></div>

      <main className="relative z-10 w-full max-w-[440px] px-6">
        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
          className="bg-surface-container-lowest rounded-[16px] shadow-[0px_12px_32px_rgba(28,28,26,0.06)] p-10 flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-10"></div>

          {/* Header Section */}
          <div className="w-full mb-8 text-left">
            <h1 className="text-[2rem] font-bold text-on-surface leading-tight tracking-tight mb-2">
              Welcome back
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mb-6 p-4 bg-error-container/10 border border-error rounded-lg">
              <p className="text-sm text-error font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant opacity-60"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="w-full px-4 py-3.5 bg-surface-container-high rounded-xl border border-outline-variant/15 focus:border-secondary focus:bg-surface-container-lowest focus:ring-0 transition-all text-on-surface outline-none"
                id="email"
                placeholder="alex@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant opacity-60"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-secondary hover:opacity-80 transition-opacity"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                className="w-full px-4 py-3.5 bg-surface-container-high rounded-xl border border-outline-variant/15 focus:border-secondary focus:bg-surface-container-lowest focus:ring-0 transition-all text-on-surface outline-none"
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={loading}
              icon={
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              }
              iconPosition="right"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-8">
            <div className="h-[1px] flex-1 bg-outline-variant opacity-20"></div>
            <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">
              or
            </span>
            <div className="h-[1px] flex-1 bg-outline-variant opacity-20"></div>
          </div>

          {/* OAuth Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full px-4 py-3.5 bg-surface-container-high rounded-xl border border-outline-variant/15 hover:border-secondary hover:bg-surface-container-lowest transition-all flex items-center justify-center gap-3 text-on-surface font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
                fill="#4285F4"
              />
              <path
                d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
                fill="#34A853"
              />
              <path
                d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.696 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-secondary hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
