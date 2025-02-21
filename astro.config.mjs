// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: "https://edwardvaisman.ca",
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), sitemap(),
  icon({
    include: {
      mdi: ['apple', 'spotify', 'github', 'file-pdf-box', 'console', 'email'],
    },
  })
  ],
  output: "server",
});
