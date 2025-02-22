// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://edwardvaisman.ca",
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      GOOGLE_API_KEY: envField.string({ context: "server", access: "secret" }),
      GOOGLE_AI_MODEL_ID: envField.string({ context: "server", access: "secret", default: "gemini-2.0-flash" }),
      RESUME_URL: envField.string({ context: "server", access: "secret", default: "https://raw.githubusercontent.com/eddyv/awesome_cv/main/cv.pdf" }),
      RESUME_CACHE_DURATION: envField.number({ context: "server", access: "secret", default: 1000 * 60 * 60 }),
    }
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
});
