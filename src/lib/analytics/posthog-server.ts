/**
 * PostHog server-side analytics helpers.
 *
 * Used for events that MUST fire regardless of client state — e.g.
 * signup_completed (server-side Supabase auth) and paid_conversion
 * (Stripe webhook handler).
 *
 * All functions are no-ops if POSTHOG_API_KEY / NEXT_PUBLIC_POSTHOG_KEY
 * is not set, so the app keeps working when PostHog is not provisioned.
 *
 * Import from server routes only (route handlers, server actions).
 */

import 'server-only';
import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!client) {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      flushAt: 1, // fire-and-forget on serverless
      flushInterval: 0,
    });
  }
  return client;
}

export async function captureServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const ph = getClient();
  if (!ph) return;
  try {
    ph.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        $lib: 'posthog-node',
        source: 'server',
      },
    });
    // On Vercel, flush immediately so the event isn't lost when the lambda freezes
    await ph.shutdown();
    client = null; // Force a fresh client on the next call
  } catch (err) {
    console.warn('[posthog-server] capture failed:', err);
  }
}

export async function identifyServer(
  distinctId: string,
  traits?: Record<string, unknown>
): Promise<void> {
  const ph = getClient();
  if (!ph) return;
  try {
    ph.identify({
      distinctId,
      properties: traits,
    });
    await ph.shutdown();
    client = null;
  } catch (err) {
    console.warn('[posthog-server] identify failed:', err);
  }
}
