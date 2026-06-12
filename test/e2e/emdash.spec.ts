import { expect, test } from "@playwright/test";

test.describe("emdash cms", () => {
  test("admin panel is reachable", async ({ request }) => {
    // The setup wizard redirect is fine; the route must never 5xx.
    const response = await request.get("/_emdash/admin", {
      maxRedirects: 5,
    });
    expect(response.status()).toBeLessThan(500);
  });

  test("admin api is exempt from the site rate limiter", async ({
    request,
  }) => {
    const response = await request.get("/_emdash/api/setup/status");
    expect(response.status()).toBe(200);
    // Our middleware adds rate-limit headers to /api/* responses only.
    expect(response.headers()["x-ratelimit-remaining"]).toBeUndefined();
  });

  test("blog images keep serving from the public directory", async ({
    request,
  }) => {
    const png = await request.get(
      "/blog/event-driven-enterprise/simple-arch.png"
    );
    expect(png.status()).toBe(200);
    expect(png.headers()["content-type"]).toContain("image/png");

    const gif = await request.get(
      "/blog/ai-agents-anthropic-mcp/tag-topics.gif"
    );
    expect(gif.status()).toBe(200);
    expect(gif.headers()["content-type"]).toContain("image/gif");
  });
});
