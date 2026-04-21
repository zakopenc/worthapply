import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter that allows 5 requests per minute
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  });
}

/**
 * Checks if the given identifier has exceeded the rate limit.
 *
 * Behavior when Redis is not configured or unreachable:
 *   - Development:  fail-OPEN (allow the request) with a single warning log
 *                   so local dev doesn't require Upstash.
 *   - Production:   fail-CLOSED (deny the request) with an error log so
 *                   misconfigured infrastructure can't silently disable all
 *                   rate limiting — which would expose the service to AI
 *                   cost abuse.
 */
let warnedNoRedis = false;
const IS_PROD = process.env.NODE_ENV === 'production';

export async function checkRateLimit(identifier: string) {
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
    return await ratelimit.limit(identifier);
  } catch (error) {
    // Redis reachable-but-failing: fail closed in production.
    console.error('[ratelimit] Redis call failed:', error);
    return {
      success: !IS_PROD,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}
