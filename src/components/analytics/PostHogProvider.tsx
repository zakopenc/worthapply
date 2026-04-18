'use client';

/**
 * Mounts the PostHog client SDK for the whole app.
 *
 * - No-ops silently if NEXT_PUBLIC_POSTHOG_KEY is not set, so local dev and
 *   un-provisioned environments keep working.
 * - Captures pageviews on every route change (App Router friendly).
 * - Captures first-touch UTM via PostHog's built-in $initial_utm_* properties
 *   (no custom cookie juggling needed).
 */

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

function PostHogPageview(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!pathname) return;

    let url = window.origin + pathname;
    const query = searchParams?.toString();
    if (query) url += `?${query}`;

    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    if (typeof window === 'undefined') return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: false, // manual, see PostHogPageview
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      autocapture: false, // keep events intentional, no auto-click capture
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          ph.debug();
        }
      },
    });
  }, []);

  // If no key, render children without the provider — keeps dev/un-provisioned working
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
