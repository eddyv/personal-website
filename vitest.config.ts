/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["test/unit/**/*.test.ts"],
    environment: "node",
    env: {
      // GOOGLE_API_KEY is the only astro:env schema var without a default.
      GOOGLE_API_KEY: "test-dummy-key",
    },
  },
});
