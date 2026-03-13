/**
 * Simple in-memory rate limiter using a sliding window.
 *
 * For production, replace with Vercel KV (Redis) or Upstash Redis.
 * This implementation works for single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request is within rate limits.
 *
 * @param key - Unique identifier (e.g. user ID, IP + path)
 * @param options - Rate limit configuration
 * @returns Whether the request is allowed + remaining quota
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // No existing entry or window expired → reset
  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.windowSec * 1000;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetAt,
    };
  }

  // Within window
  if (entry.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Preset rate limits per 07-api-design.md §3.2
 */
export const RATE_LIMITS = {
  /** Thumbnail generation: 10 per minute */
  generation: { limit: 10, windowSec: 60 },
  /** A/B test tracking: 100 per minute per test */
  abTracking: { limit: 100, windowSec: 60 },
  /** API general: 60 per minute */
  general: { limit: 60, windowSec: 60 },
  /** Auth attempts: 5 per minute */
  auth: { limit: 5, windowSec: 60 },
} as const;
