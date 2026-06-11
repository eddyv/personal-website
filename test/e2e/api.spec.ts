import { expect, test } from "@playwright/test";

test.describe("api surface", () => {
  test("gemini endpoint rejects a malformed body with a JSON error", async ({
    request,
  }) => {
    // A non-JSON body fails parsing inside the route regardless of whether a
    // real API key is configured, so this is deterministic locally and in CI.
    const response = await request.post("/api/llm/gemini", {
      headers: { "Content-Type": "application/json" },
      data: "not-json",
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = (await response.json()) as { error?: string };
    expect(typeof body.error).toBe("string");

    expect(response.headers()["x-ratelimit-remaining"]).toBeDefined();
    expect(response.headers()["x-ratelimit-reset"]).toBeDefined();
    expect(response.headers()["retry-after"]).toBeDefined();
  });

  test("gemini endpoint answers CORS preflight", async ({ request }) => {
    // In dev, Vite answers OPTIONS preflights before our middleware runs, so
    // only assert that a browser would be allowed to POST. The middleware's
    // exact headers are pinned by test/unit/cors.test.ts.
    const response = await request.fetch("/api/llm/gemini", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:4321",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    expect(response.status()).toBeLessThan(400);
    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBeDefined();
    expect(headers["access-control-allow-methods"]).toContain("POST");
  });

  test("robots.txt disallows the api and points at the sitemap", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Disallow: /api/*");
    expect(body).toContain(
      "Sitemap: https://edwardvaisman.ca/sitemap-index.xml"
    );
  });
});
