import type { APIContext, MiddlewareNext } from "astro";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expectResponse } from "./helpers";

vi.mock("astro:env/server", () => ({
  RATE_LIMITER_WINDOW_MS: 1000,
  RATE_LIMITER_MAX_REQUESTS_PER_WINDOW: 3,
}));

vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn: unknown) => fn,
}));

const importRateLimiterModule = async () => {
  vi.resetModules();
  return await import("../../src/middleware/rate-limitter");
};

const createContext = (url: string, headers?: Record<string, string>) =>
  ({
    request: new Request(url, { headers }),
  }) as unknown as APIContext;

const passthroughNext = (() =>
  Promise.resolve(new Response("ok", { status: 200 }))) as MiddlewareNext;

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not limit requests under the maximum", async () => {
    const { RateLimiter } = await importRateLimiterModule();
    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 });

    expect(limiter.isRateLimited("client-a")).toBe(false);
    expect(limiter.isRateLimited("client-a")).toBe(false);
    expect(limiter.isRateLimited("client-a")).toBe(false);
  });

  it("limits requests over the maximum within a window", async () => {
    const { RateLimiter } = await importRateLimiterModule();
    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 });

    limiter.isRateLimited("client-a");
    limiter.isRateLimited("client-a");
    limiter.isRateLimited("client-a");
    expect(limiter.isRateLimited("client-a")).toBe(true);
  });

  it("resets the limit after the window expires", async () => {
    const { RateLimiter } = await importRateLimiterModule();
    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 1 });

    limiter.isRateLimited("client-a");
    expect(limiter.isRateLimited("client-a")).toBe(true);

    vi.advanceTimersByTime(1001);
    expect(limiter.isRateLimited("client-a")).toBe(false);
  });

  it("tracks identifiers independently", async () => {
    const { RateLimiter } = await importRateLimiterModule();
    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 1 });

    limiter.isRateLimited("client-a");
    expect(limiter.isRateLimited("client-a")).toBe(true);
    expect(limiter.isRateLimited("client-b")).toBe(false);
  });

  it("reports remaining requests", async () => {
    const { RateLimiter } = await importRateLimiterModule();
    const limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 });

    expect(limiter.getRateLimitInfo("client-a").remaining).toBe(3);
    limiter.isRateLimited("client-a");
    expect(limiter.getRateLimitInfo("client-a").remaining).toBe(2);
  });
});

describe("rateLimiterMiddleware", () => {
  it("ignores non-api routes", async () => {
    const { rateLimiterMiddleware } = await importRateLimiterModule();
    const response = expectResponse(
      await rateLimiterMiddleware(
        createContext("https://example.com/"),
        passthroughNext
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-RateLimit-Remaining")).toBeNull();
  });

  it("adds rate limit headers to api responses", async () => {
    const { rateLimiterMiddleware } = await importRateLimiterModule();
    const response = expectResponse(
      await rateLimiterMiddleware(
        createContext("https://example.com/api/llm/gemini", {
          "CF-Connecting-IP": "10.0.0.1",
        }),
        passthroughNext
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("2");
    expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });

  it("does not invoke next() once the limit is exceeded", async () => {
    const { rateLimiterMiddleware } = await importRateLimiterModule();
    const next = vi.fn(passthroughNext);
    const context = () =>
      createContext("https://example.com/api/llm/gemini", {
        "CF-Connecting-IP": "10.0.0.3",
      });

    await rateLimiterMiddleware(context(), next);
    await rateLimiterMiddleware(context(), next);
    await rateLimiterMiddleware(context(), next);
    expect(next).toHaveBeenCalledTimes(3);

    const limited = expectResponse(
      await rateLimiterMiddleware(context(), next)
    );
    expect(limited.status).toBe(429);
    expect(next).toHaveBeenCalledTimes(3); // unchanged — the work was skipped
  });

  it("returns 429 with a JSON body once the limit is exceeded", async () => {
    const { rateLimiterMiddleware } = await importRateLimiterModule();
    const context = () =>
      createContext("https://example.com/api/llm/gemini", {
        "CF-Connecting-IP": "10.0.0.2",
      });

    await rateLimiterMiddleware(context(), passthroughNext);
    await rateLimiterMiddleware(context(), passthroughNext);
    await rateLimiterMiddleware(context(), passthroughNext);
    const limited = expectResponse(
      await rateLimiterMiddleware(context(), passthroughNext)
    );

    expect(limited.status).toBe(429);
    expect(limited.headers.get("X-RateLimit-Remaining")).toBe("0");

    const body = (await limited.json()) as {
      error: string;
      remainingRequests: number;
    };
    expect(body.error).toBe("Rate limit exceeded");
    expect(body.remainingRequests).toBe(0);
  });
});
