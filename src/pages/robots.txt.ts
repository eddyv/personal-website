/**
 * This file is a route that returns the robots.txt file for your site. Instead of having a static file in `public` this allows the sitemap to reuse
 * the site URL from the `astro.config.mjs` file.
 *
 */
import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Disallow: /api/
Sitemap: ${sitemapURL.href}`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
