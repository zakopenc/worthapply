import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Per-minute sliding-window rate limit, backed by Upstash Redis.
// A single limiter instance is reused — each call gets its own bucket
// via a namespaced key (user_id:scope).
//
// 20 requests per minute per bucket. A "bucket" is (user_id, scope),
// so each AI endpoint has its own 20-rpm quota — hitting the tailor
// endpoint doesn't burn your cover-letter quota. The daily AI token
// budget (src/lib/ai-token-budget.ts) handles longer-horizon cost
// control; this rate limiter is purely a burst/abuse guard.
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
  });
}

let warnedNoRedis = false;
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Checks if the given identifier has exceeded the rate limit.
 *
 * @param identifier  Usually the authenticated user id.
 * @param scope       Optional endpoint scope so each endpoint gets its own
 *                    bucket (e.g. 'cover-letter', 'tailor'). Defaults to
 *                    'global' for legacy unscoped callers.
 *
 * Behavior when Redis is not configured or unreachable:
 *   - Development:  fail-OPEN (allow the request) with a single warning log
 *                   so local dev doesn't require Upstash.
 *   - Production:   fail-CLOSED (deny the request) with an error log so
 *                   misconfigured infrastructure can't silently disable all
 *                   rate limiting.
 */
export async function checkRateLimit(identifier: string, scope: string = 'global') {
  const key = `${identifier}:${scope}`;

  if (!ratelimit) {
    if (!warnedNoRedis) {
      if (IS_PROD) {
        console.error('[ratelimit] CRITICAL: Upstash Redis not configured in production. Failing CLOSED — all rate-limited endpoints will 429 until UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.');
      } else {
        console.warn('[ratelimit] Upstash Redis not configured — rate limiting disabled in development. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to test rate limiting.');
      }
      warnedNoRedis = true;
    }
    return {
      success: !IS_PROD,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  try {
    return await ratelimit.limit(key);
  } catch (error) {
    console.error('[ratelimit] Redis call failed:', error);
    return {
      success: !IS_PROD,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}
