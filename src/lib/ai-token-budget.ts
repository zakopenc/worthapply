import { Redis } from '@upstash/redis';
import type { Plan } from '@/lib/plans';

// ── Daily per-user AI credit budget ──────────────────────────────────────
//
// This is a second safety rail ABOVE the per-minute rate limiter. A determined
// attacker (or a user with leaked credentials) could respect the per-minute
// limit while still burning through tens of thousands of AI calls per day.
// This budget caps daily total cost.
//
// Credits are a synthetic unit ≈ "one inexpensive AI call". We weight each
// endpoint roughly by its prompt + expected output size so an interview-prep
// request (huge output) costs more than a chat message.
//
// Storage: Upstash Redis, key scheme `ai_budget:{userId}:{YYYY-MM-DD}`, with
// TTL of 2 days so old keys self-expire. Reset is automatic at 00:00 UTC.

export type AiEndpointKind =
  | 'analyze'
  | 'tailor'
  | 'cover_letter'
  | 'interview_prep'
  | 'offer_evaluation'
  | 'outreach'
  | 'chat'
  | 'natural_voice'
  | 'resume_parse';

// Credit cost per endpoint kind. Tuned so typical usage fits comfortably.
export const AI_CREDIT_COST: Record<AiEndpointKind, number> = {
  analyze: 2,
  tailor: 3,
  cover_letter: 2,
  interview_prep: 4,
  offer_evaluation: 4,
  outreach: 2,
  chat: 1,
  natural_voice: 1,
  resume_parse: 2,
};

// Daily credit budget per plan.
const DAILY_BUDGET: Record<Plan, number> = {
  free: 20,      // ≈ 10 analyses or 6-7 tailorings
  pro: 150,      // ≈ ~50 tailorings + chat
  premium: 400,  // ≈ full-throttle job search day
};

// Minimum budget for unknown plans (defensive).
const FALLBACK_BUDGET = DAILY_BUDGET.free;

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = Redis.fromEnv();
}

const IS_PROD = process.env.NODE_ENV === 'production';
let warnedNoRedis = false;

function todayKey(userId: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `ai_budget:${userId}:${yyyy}-${mm}-${dd}`;
}

export interface BudgetResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  cost: number;
  reason?: string;
}

/**
 * Atomically reserves `cost` credits against the user's daily budget.
 * If the request would exceed the budget, nothing is reserved and allowed=false.
 *
 * Fail-closed in production if Redis is unreachable — same policy as ratelimit.
 * Fail-open in development for convenience.
 */
export async function reserveAiBudget(
  userId: string,
  plan: Plan,
  kind: AiEndpointKind
): Promise<BudgetResult> {
  const limit = DAILY_BUDGET[plan] ?? FALLBACK_BUDGET;
  const cost = AI_CREDIT_COST[kind] ?? 1;

  if (!redis) {
    if (!warnedNoRedis) {
      if (IS_PROD) {
        console.error('[ai-budget] CRITICAL: Redis not configured in production — failing CLOSED');
      } else {
        console.warn('[ai-budget] Redis not configured — budget disabled in development');
      }
      warnedNoRedis = true;
    }
    return {
      allowed: !IS_PROD,
      used: 0,
      limit,
      remaining: limit,
      cost,
      reason: IS_PROD ? 'Budget service unavailable' : undefined,
    };
  }

  const key = todayKey(userId);
  try {
    // Atomically increment and get back the new total.
    const newTotal = await redis.incrby(key, cost);
    if (newTotal === cost) {
      // First increment today — set TTL to 2 days so it auto-expires.
      await redis.expire(key, 60 * 60 * 48);
    }

    if (newTotal > limit) {
      // Roll back the increment so we don't count this as used.
      await redis.decrby(key, cost);
      return {
        allowed: false,
        used: newTotal - cost,
        limit,
        remaining: Math.max(0, limit - (newTotal - cost)),
        cost,
        reason: `Daily AI budget reached (${limit} credits / day). Resets at 00:00 UTC.`,
      };
    }

    return {
      allowed: true,
      used: newTotal,
      limit,
      remaining: Math.max(0, limit - newTotal),
      cost,
    };
  } catch (error) {
    console.error('[ai-budget] Redis error:', error);
    return {
      allowed: !IS_PROD,
      used: 0,
      limit,
      remaining: limit,
      cost,
      reason: IS_PROD ? 'Budget service error' : undefined,
    };
  }
}

/**
 * Refunds credits if an AI call errored out AFTER the budget was reserved —
 * prevents users from losing budget to our infrastructure failures.
 */
export async function refundAiBudget(userId: string, kind: AiEndpointKind): Promise<void> {
  if (!redis) return;
  const cost = AI_CREDIT_COST[kind] ?? 1;
  const key = todayKey(userId);
  try {
    await redis.decrby(key, cost);
  } catch (error) {
    console.error('[ai-budget] Refund error:', error);
  }
}
