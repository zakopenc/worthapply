// Content-Security-Policy — allowlist-based, defense-in-depth against XSS.
//
// We use 'unsafe-inline' for scripts (required for Next.js hydration + inline
// server components) rather than nonces, which would need middleware-level
// nonce injection and break Next.js streaming responses. The allowlist is
// curated to our current third-party integrations:
//   - Stripe   (js.stripe.com, hooks.stripe.com, api.stripe.com)
//   - Supabase (*.supabase.co + WS for realtime)
//   - PostHog  (app/us-assets.i.posthog.com)
//   - Sentry   (sentry-cdn, sentry.io ingest)
//   - Gemini   (generativelanguage.googleapis.com)
//   - DeepSeek (api.together.xyz) — fallback LLM provider
//   - Resend   (api.resend.com)
// Adding a new third-party service requires an entry here.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://app.posthog.com https://us-assets.i.posthog.com https://*.sentry-cdn.com https://browser.sentry-cdn.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.posthog.com https://us.i.posthog.com https://app.posthog.com https://*.sentry.io https://*.ingest.sentry.io https://api.resend.com https://generativelanguage.googleapis.com https://api.together.xyz",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: CSP_DIRECTIVES,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
