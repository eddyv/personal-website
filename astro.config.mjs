// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://edwardvaisman.ca",
  trailingSlash: "never",

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      // @ts-ignore
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
    // build: {
    //   // react minification 
    //   minify: false,
    // }
  },

  env: {
    schema: {
      GOOGLE_API_KEY: envField.string({ context: "server", access: "secret" }),
      GOOGLE_AI_MODEL_ID: envField.string({
        context: "server",
        access: "secret",
        default: "gemini-2.0-flash",
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
        mdi: ["apple", "spotify", "github", "file-pdf-box", "console", "email"],
      },
    }),
  ],

  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "passthrough",
  }),
});
