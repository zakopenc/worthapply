/**
 * PostHog client-side analytics helpers.
 *
 * All functions are no-ops if NEXT_PUBLIC_POSTHOG_KEY is not set, so the
 * app keeps working in local dev or when PostHog is not yet provisioned.
 *
 * Import from client components only.
 */

'use client';

import posthog from 'posthog-js';

export type PosthogEvent =
  | 'homepage_view'
  | 'demo_started'
  | 'ats_checker_used'
  | 'signup_started'
  | 'signup_completed'
  | 'first_fit_analysis_completed'
  | 'paid_conversion';

export function isPosthogReady(): boolean {
  if (typeof window === 'undefined') return false;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return false;
  return (posthog as unknown as { __loaded?: boolean }).__loaded === true;
}

export function capture(
  event: PosthogEvent | string,
  properties?: Record<string, unknown>
): void {
  if (!isPosthogReady()) return;
  try {
    posthog.capture(event, properties);
  } catch (err) {
    console.warn('[posthog] capture failed:', err);
  }
}

/**
 * Identify the current user. Call right after a successful signup or login.
 * `distinctId` should be the Supabase user.id.
 *
 * Uses $set_once for initial attribution so we don't overwrite first-touch
 * UTM values on later identify calls.
 */
export function identify(
  distinctId: string,
  traits?: Record<string, unknown>
): void {
  if (!isPosthogReady()) return;
  try {
    posthog.identify(distinctId, traits, {
      // Preserve first-touch attribution via $set_once semantics
      $set_once: {
        initial_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        initial_referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
    });
  } catch (err) {
    console.warn('[posthog] identify failed:', err);
  }
}

export function reset(): void {
  if (!isPosthogReady()) return;
  try {
    posthog.reset();
  } catch (err) {
    console.warn('[posthog] reset failed:', err);
  }
}
