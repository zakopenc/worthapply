'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { fetchIsAdmin } from '@/lib/admin/fetch-is-admin';
import { capture, identify } from '@/lib/analytics/posthog-client';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  // Marky P0: fire signup_started on mount
  useEffect(() => {
    capture('signup_started', {
      return_url: returnUrl || null,
      entry_page: typeof window !== 'undefined' ? window.location.pathname : null,
    });
  }, [returnUrl]);

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create or update profile (use upsert to avoid duplicate key errors)
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          plan: 'free', // Ensure plan is set
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'id', // If id already exists, update instead of insert
          ignoreDuplicates: false, // Update the row if it exists
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError('Failed to create profile. Please try again.');
          setLoading(false);
          return;
        }

        // Marky P0: identify user + fire signup_completed immediately so the
        // anonymous session stitches to the known user with first-touch UTM
        // preserved by PostHog's $initial_* properties.
        identify(data.user.id, {
          email: email.trim(),
          full_name: fullName.trim(),
          plan: 'free',
          signup_date: new Date().toISOString(),
        });
        capture('signup_completed', {
          plan: 'free',
          entry_page: typeof window !== 'undefined' ? window.location.pathname : null,
          requires_email_confirmation: !data.session,
        });

        // Check if email confirmation is required
        if (data.session) {
          // Auto-confirmed: honor returnUrl, else admin → /admin, else /dashboard
          if (returnUrl) {
            router.push(decodeURIComponent(returnUrl));
          } else {
            const isAdmin = await fetchIsAdmin(supabase, data.user.id);
            router.push(isAdmin ? '/admin' : '/dashboard');
          }
        } else {
          // Email confirmation required, redirect to verify-email page
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
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
      {/* Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #cfc5bd 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.15,
        }}
      ></div>

      {/* Main Signup Canvas */}
      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
          className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(28,28,26,0.06)] p-6 md:p-10 flex flex-col items-center w-full max-w-sm">
          {/* Logo Section */}
          <div className="mb-10"></div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Create your account
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mb-6 p-4 bg-error-container/10 border border-error rounded-lg">
              <p className="text-sm text-error font-medium">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="w-full space-y-6">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label
                className="text-[0.75rem] font-semibold uppercase tracking-widest text-secondary ml-1"
                htmlFor="full_name"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 bg-surface-container-highest border-none rounded-xl focus:ring-1 focus:ring-secondary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline/50"
                  id="full_name"
                  placeholder="Alex Morgan"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                className="text-[0.75rem] font-semibold uppercase tracking-widest text-secondary ml-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 bg-surface-container-highest border-none rounded-xl focus:ring-1 focus:ring-secondary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline/50"
                  id="email"
                  placeholder="alex@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                className="text-[0.75rem] font-semibold uppercase tracking-widest text-secondary ml-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3.5 bg-surface-container-highest border-none rounded-xl focus:ring-1 focus:ring-secondary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline/50"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-on-surface-variant/60 ml-1 mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 px-1">
              <input
                className="mt-1 h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary/20 bg-surface-container-highest cursor-pointer"
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading}
                required
              />
              <label
                className="text-sm text-on-surface-variant leading-tight cursor-pointer select-none"
                htmlFor="terms"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-secondary hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-secondary hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary hover:bg-primary/90 font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-8">
              <hr className="w-full border-outline-variant/20" />
              <span className="absolute bg-surface-container-lowest px-4 text-xs font-bold text-outline-variant uppercase tracking-widest">
                OR
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-surface-container-highest hover:bg-surface-container border border-outline-variant/20 text-on-surface font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-secondary hover:underline"
            >
              Log in
            </Link>
          </p>

          {/* Footer Attribution */}
          <div className="mt-8 text-center">
            <p className="text-[0.65rem] uppercase tracking-widest font-extrabold text-outline-variant/40">
              Precision Privacy Growth v2.4.0
            </p>
          </div>
        </motion.div>

        {/* Bottom Attribution */}
        <p className="text-center text-xs text-outline-variant/50 mt-8 font-medium tracking-wide">
          Architectural Integrity
        </p>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4 text-xs text-on-surface-variant/60 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm">
        <span>© 2026 WorthApply</span>
        <Link href="/privacy" className="hover:text-secondary transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-secondary transition-colors">
          Terms
        </Link>
        <Link
          href="mailto:hello@worthapply.com"
          className="hover:text-secondary transition-colors"
        >
          Contact
        </Link>
      </footer>
    </div>
  );
}
