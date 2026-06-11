import { getViteConfig } from "astro/config";
import type { ViteUserConfig } from "vitest/config";

const config: ViteUserConfig = {
  test: {
    include: ["test/unit/**/*.test.ts"],
    environment: "node",
  },
};

export default getViteConfig(config, {
  // Skip astro.config.mjs: the Cloudflare adapter's vite plugin validates
  // worker environments and is incompatible with vitest's node environment.
  // Unit tests mock astro:env/server and astro:middleware themselves.
  configFile: false,
});
