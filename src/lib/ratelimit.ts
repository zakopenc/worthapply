import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── Plan-tiered per-minute rate limits (backed by Upstash Redis) ─────────
//
// Each user has their own per-endpoint bucket, with the bucket size
// depending on their plan:
//
//   free      : 30  req/min  (generous for iteration; daily budget caps total cost anyway)
//   pro       : 120 req/min  (paying user; never hits during normal use)
//   premium   : 240 req/min  (power user; never hits)
//   (unknown) : 30  req/min  (safe fallback for unrecognised plans)
//
// These caps exist to block burst abuse / scripted attacks, not to ration
// product usage. The daily AI credit budget (src/lib/ai-token-budget.ts)
// is the primary long-horizon cost control — it prevents any plan from
// spending more than their tier's daily credits regardless of how fast
// they click, so we can leave these per-minute caps comfortably high.
//
// Per-endpoint keys keep endpoints independent: hammering /api/tailor
// doesn't drain your /api/cover-letter quota.

type TierName = 'free' | 'pro' | 'premium' | 'default';

const TIER_RPM: Record<TierName, number> = {
  free: 30,
  pro: 120,
  premium: 240,
  default: 30,
};

function makeLimiter(rpm: number): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(rpm, '1 m'),
    analytics: true,
    prefix: `ratelimit:${rpm}`,
  });
}

const limiters: Record<TierName, Ratelimit | null> = {
  free: null,
  pro: null,
  premium: null,
  default: null,
};

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  (Object.keys(TIER_RPM) as TierName[]).forEach((tier) => {
    limiters[tier] = makeLimiter(TIER_RPM[tier]);
  });
}

let warnedNoRedis = false;
const IS_PROD = process.env.NODE_ENV === 'production';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;           // epoch ms when the bucket resets
  retryAfterSeconds: number; // seconds until the user can retry (>=1)
  tier: TierName;
}

/**
 * Checks if the given identifier has exceeded the rate limit.
 *
 * @param identifier  Usually the authenticated user id.
 * @param scope       Endpoint scope ('cover-letter', 'tailor', ...). Each
 *                    scope has its own independent bucket.
 * @param plan        Optional plan — when provided, a higher bucket is used
 *                    for paid tiers. Falls back to 'default' for unknown plans.
 *
 * Fail-CLOSED in production if Redis is unavailable, fail-OPEN in dev.
 */
export async function checkRateLimit(
  identifier: string,
  scope: string = 'global',
  plan?: string
): Promise<RateLimitResult> {
  const tier: TierName = plan && plan in limiters ? (plan as TierName) : 'default';
  const limiter = limiters[tier];
  const key = `${identifier}:${scope}`;

  if (!limiter) {
    if (!warnedNoRedis) {
      if (IS_PROD) {
        console.error('[ratelimit] CRITICAL: Upstash Redis not configured in production. Failing CLOSED — all rate-limited endpoints will 429 until UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.');
      } else {
        console.warn('[ratelimit] Upstash Redis not configured — rate limiting disabled in development.');
      }
      warnedNoRedis = true;
    }
    const success = !IS_PROD;
    return {
      success,
      limit: TIER_RPM[tier],
      remaining: success ? TIER_RPM[tier] : 0,
      reset: Date.now() + 60_000,
      retryAfterSeconds: success ? 0 : 60,
      tier,
    };
  }

  try {
    const result = await limiter.limit(key);
    const retryAfterSeconds = result.success
      ? 0
      : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfterSeconds,
      tier,
    };
  } catch (error) {
    console.error('[ratelimit] Redis call failed:', error);
    const success = !IS_PROD;
    return {
      success,
      limit: TIER_RPM[tier],
      remaining: success ? TIER_RPM[tier] : 0,
      reset: Date.now() + 60_000,
      retryAfterSeconds: success ? 0 : 60,
      tier,
    };
  }
}

/**
 * Build a 429 response body for AI-endpoint rate-limit rejections. Use this
 * instead of hand-rolling error messages so clients get consistent shape.
 */
export function buildRateLimitErrorBody(result: RateLimitResult, scope: string) {
  return {
    error: `You're hitting our per-minute limit on ${scope}. Try again in ${result.retryAfterSeconds}s.`,
    rate_limited: true,
    scope,
    retry_after_seconds: result.retryAfterSeconds,
    reset_at: new Date(result.reset).toISOString(),
    tier: result.tier,
    limit_per_minute: result.limit,
    upgrade_hint: result.tier === 'free' || result.tier === 'default'
      ? 'Pro raises this to 120/min per feature. Premium raises it to 240/min.'
      : undefined,
  };
}
