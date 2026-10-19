import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory rate limiter fallback
interface MemoryLimitEntry {
  count: number;
  resetAt: number;
}
const memoryRateLimits = new Map<string, MemoryLimitEntry>();

let upstashLimiter: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    const redis = new Redis({ url, token });
    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour
      analytics: true,
      prefix: "gitanswer_ratelimit",
    });
    return upstashLimiter;
  }

  return null;
}

export async function checkRateLimit(clientIp: string): Promise<RateLimitResult> {
  const isLocalhost =
    clientIp === "127.0.0.1" ||
    clientIp === "::1" ||
    clientIp === "localhost" ||
    process.env.NODE_ENV === "development";

  // In local development, bypass the 5/hr throttle so the developer is not locked out while building
  if (isLocalhost && !process.env.UPSTASH_REDIS_REST_URL) {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 3600000,
    };
  }

  const limiter = getUpstashLimiter();

  if (limiter) {
    try {
      const res = await limiter.limit(clientIp);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.warn("[RateLimit] Upstash limiter error, falling back to memory:", err);
    }
  }

  // Memory sliding window fallback
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const limit = 5;

  const entry = memoryRateLimits.get(clientIp);

  if (!entry || now > entry.resetAt) {
    memoryRateLimits.set(clientIp, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (entry.count < limit) {
    entry.count += 1;
    return {
      success: true,
      limit,
      remaining: limit - entry.count,
      reset: entry.resetAt,
    };
  }

  return {
    success: false,
    limit,
    remaining: 0,
    reset: entry.resetAt,
  };
}
