'use client';

/**
 * Lightweight client shim to fire a PostHog event from a server component page.
 *
 * Usage: drop <TrackEvent event="homepage_view" /> inside any server component
 * and the event will fire once per mount, client-side. For conditional or
 * property-rich firings (e.g. on form submit), call `capture()` directly from
 * a client component instead.
 */

import { useEffect } from 'react';
import { capture, type PosthogEvent } from '@/lib/analytics/posthog-client';

interface TrackEventProps {
  event: PosthogEvent | string;
  properties?: Record<string, unknown>;
}

export function TrackEvent({ event, properties }: TrackEventProps) {
  useEffect(() => {
    capture(event, properties);
    // Fire exactly once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
