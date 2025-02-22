import {
  RATE_LIMITTER_MAX_REQUESTS_PER_WINDOW,
  RATE_LIMITTER_WINDOW_MS,
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
  private store: Map<string, RateLimitInfo>;
  private windowMs: number;
  private maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.store = new Map();
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.store.entries()) {
      if (now >= info.resetTime) {
        this.store.delete(key);
      }
    }
  }

  public isRateLimited(identifier: string): boolean {
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

  public getRateLimitInfo(identifier: string): {
    remaining: number;
    resetTime: number | null;
  } {
    const info = this.store.get(identifier);
    return {
      remaining: info
        ? Math.max(0, this.maxRequests - info.count)
        : this.maxRequests,
      resetTime: info?.resetTime || null,
    };
  }
}

const rateLimiter = new RateLimiter({
  windowMs: RATE_LIMITTER_WINDOW_MS,
  maxRequests: RATE_LIMITTER_MAX_REQUESTS_PER_WINDOW,
});

export const rateLimiterMiddleware = defineMiddleware(async (context, next) => {
  const { request } = context;

  // Only apply rate limiting to the AI endpoint
  if (!request.url.includes("/api/")) {
    console.log("Skipping rate limiting middleware");
    return next();
  }

  // Use both client ID and IP for more robust rate limiting
  const clientId = request.headers.get("X-Client-ID");
  const clientIP =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
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
    Math.ceil((resetTime! - Date.now()) / 1000).toString(),
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
          "X-RateLimit-Reset": resetTime?.toString() || "",
          "Retry-After": Math.ceil((resetTime! - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
