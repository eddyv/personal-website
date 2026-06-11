// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import icon from "astro-icon";
import svgr from "vite-plugin-svgr";

// https://astro.build/config
export default defineConfig({
  site: "https://edwardvaisman.ca",
  trailingSlash: "never",

  // The dev toolbar overlays the dock and intercepts Playwright clicks.
  devToolbar: {
    enabled: !process.env.PLAYWRIGHT_TEST,
  },

  vite: {
    plugins: [tailwindcss(), svgr({ include: "**/*.svg?react" })],
    ssr: {
      optimizeDeps: {
        // workerd's module runner does not define `module`/`require` as
        // globals, so externalized CJS deps (e.g. `debug` via astro-icon,
        // `picomatch` via astro's glob loader) crash dev with "module is not
        // defined" unless pre-bundled. Clear node_modules/.vite and .astro
        // when changing this list.
        include: [
          "astro/zod",
          "astro/env/runtime",
          "astro/assets/services/noop",
          "astro-seo",
          "astro-icon/components",
          "debug",
          "picomatch",
          "tinyglobby",
        ],
      },
    },
  },

  env: {
    schema: {
      GOOGLE_API_KEY: envField.string({ context: "server", access: "secret" }),
      GOOGLE_AI_MODEL_ID: envField.string({
        context: "server",
        access: "secret",
        default: "gemini-3.1-flash-lite-preview",
      }),
      RESUME_URL: envField.string({
        context: "server",
        access: "secret",
        default:
          "https://raw.githubusercontent.com/eddyv/awesome_cv/main/cv.pdf",
      }),
      RESUME_CACHE_DURATION: envField.number({
        context: "server",
        access: "secret",
        default: 1000 * 60 * 60,
      }),
      RATE_LIMITER_WINDOW_MS: envField.number({
        context: "server",
        access: "secret",
        default: 15 * 60 * 1000,
      }),
      RATE_LIMITER_MAX_REQUESTS_PER_WINDOW: envField.number({
        context: "server",
        access: "secret",
        default: 100,
      }),
    },
  },

  integrations: [
    react(),
    sitemap(),
    icon({
      include: {
        mdi: [
          "apple",
          "spotify",
          "github",
          "file-pdf-box",
          "console",
          "email",
          "linkedin",
        ],
      },
    }),
  ],

  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
});
