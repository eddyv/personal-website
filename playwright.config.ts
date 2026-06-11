import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    // Frontmatter dates are midnight UTC; NotesApp formats them in the
    // browser's timezone. Pin UTC so date assertions are deterministic.
    timezoneId: "UTC",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PLAYWRIGHT_TEST: "1",
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ?? "test-dummy-key",
      // Every dev request shares the "unknown" client IP, so the suite would
      // rate-limit itself with the production default.
      RATE_LIMITER_MAX_REQUESTS_PER_WINDOW: "100000",
    },
  },
});
