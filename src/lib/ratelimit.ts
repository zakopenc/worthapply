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
 * Falls back to success if Redis is not configured.
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimit) {
    // Graceful fallback if Upstash is not yet configured by the user
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
  return await ratelimit.limit(identifier);
}
