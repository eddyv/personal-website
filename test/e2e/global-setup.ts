/**
 * Runs once after the Playwright webServer is ready.
 *
 * EmDash auto-seeds collections from .emdash/seed.json on the first request
 * against an empty database, but seed *content* and the admin user are only
 * applied by the setup flow. The dev-bypass endpoint (dev-only) completes
 * setup and applies the seed content idempotently.
 *
 * If local content looks stale (seed.json changed since the database was
 * created), reset with: rm -rf .wrangler/state
 */
export default async function globalSetup(): Promise<void> {
  const response = await fetch(
    "http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin",
    { redirect: "manual" }
  );
  if (response.status >= 500) {
    throw new Error(
      `EmDash dev-bypass setup failed with status ${response.status}`
    );
  }
}
