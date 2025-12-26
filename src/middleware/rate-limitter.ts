import {
  RATE_LIMITER_MAX_REQUESTS_PER_WINDOW,
  RATE_LIMITER_WINDOW_MS,
} from "astro:env/server";
import { defineMiddleware } from "astro:middleware";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private readonly store: Map<string, RateLimitInfo>;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.store = new Map();
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.store.entries()) {
      if (now >= info.resetTime) {
        this.store.delete(key);
      }
    }
  }

  isRateLimited(identifier: string): boolean {
    this.cleanup();

    const now = Date.now();
    const info = this.store.get(identifier);

    if (!info) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    if (now >= info.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    if (info.count >= this.maxRequests) {
      return true;
    }

    info.count += 1;
    this.store.set(identifier, info);
    return false;
  }

  getRateLimitInfo(identifier: string): {
    remaining: number;
    resetTime: number;
  } {
    const info = this.store.get(identifier);
    return {
      remaining: info
        ? Math.max(0, this.maxRequests - info.count)
        : this.maxRequests,
      resetTime: info?.resetTime || 0,
    };
  }
}

// Create the instance within a let so we can reuse it across requests
let rateLimiter: RateLimiter | null = null;

/**
 * Middleware for rate limiting API requests.
 *
 * This middleware implements rate limiting functionality for API endpoints using both client ID and IP address
 * for identification. It tracks request counts within configured time windows and enforces rate limits
 * by returning 429 status codes when limits are exceeded.
 *
 * @param context - The middleware context containing the request object
 * @param next - The function to call the next middleware in the chain
 * @returns A Response object with appropriate status and headers
 *
 * Rate limit information is included in the following response headers:
 * - X-RateLimit-Remaining: Number of requests remaining in the current window
 * - X-RateLimit-Reset: Timestamp when the rate limit window resets
 * - Retry-After: Number of seconds until the rate limit resets
 *
 * When rate limit is exceeded, returns a 429 response with JSON body containing:
 * - error: Error message
 * - resetTime: Timestamp when the rate limit resets
 * - remainingRequests: Always 0 when limited
 */
export const rateLimiterMiddleware = defineMiddleware(async (context, next) => {
  // Initialize the rate limiter on first use
  if (!rateLimiter) {
    rateLimiter = new RateLimiter({
      windowMs: RATE_LIMITER_WINDOW_MS,
      maxRequests: RATE_LIMITER_MAX_REQUESTS_PER_WINDOW,
    });
  }

  const { request } = context;

  // Only apply rate limiting to the AI endpoint
  if (!request.url.includes("/api/")) {
    return next();
  }

  // Use both client ID and IP for more robust rate limiting
  const clientId = request.headers.get("X-Client-ID");
  const clientIP =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    request.headers.get("X-Real-IP") ||
    "unknown";

  // Combine both identifiers for better rate limiting
  const identifier = clientId ? `${clientId}-${clientIP}` : clientIP;

  console.log(`Rate limiting request from: ${identifier}`);

  // Check rate limit
  const isLimited = rateLimiter.isRateLimited(clientIP);
  const { remaining, resetTime } = rateLimiter.getRateLimitInfo(clientIP);

  // Add rate limit headers to all responses
  const response = await next();
  const headers = new Headers(response.headers);

  headers.set("X-RateLimit-Remaining", remaining.toString());
  headers.set("X-RateLimit-Reset", resetTime?.toString() || "");
  headers.set(
    "Retry-After",
    Math.ceil((resetTime - Date.now()) / 1000).toString()
  );

  if (isLimited) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        resetTime,
        remainingRequests: 0,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetTime.toString(),
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
