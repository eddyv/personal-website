/**
 * Converts the markdown blog posts into an EmDash seed file.
 *
 * Usage: bun scripts/markdown-to-seed/index.ts
 *
 * Reads src/content/blog/*.md, converts each post's markdown body to
 * Portable Text, and writes the committed .emdash/seed.json that EmDash
 * applies on the first request against an empty database.
 */
import fs from "node:fs";
import path from "node:path";
import { validateSeed } from "emdash";
import { markdownToPost } from "./convert";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BLOG_DIR = path.join(ROOT, "src/content/blog");
const SEED_PATH = path.join(ROOT, ".emdash/seed.json");

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((file) => file.endsWith(".md"))
  .sort();

const MD_EXTENSION = /\.md$/;

const tagSlugs = new Set<string>();
const entries = files.map((file) => {
  const slug = file.replace(MD_EXTENSION, "");
  const markdown = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { frontmatter, blocks } = markdownToPost(markdown, slug);

  for (const tag of frontmatter.tags) {
    tagSlugs.add(tag);
  }

  return {
    id: slug,
    slug,
    status: frontmatter.draft ? ("draft" as const) : ("published" as const),
    taxonomies: { tag: frontmatter.tags },
    data: {
      title: frontmatter.title,
      date: frontmatter.date.toISOString(),
      preview: frontmatter.preview,
      content: blocks,
    },
  };
});

const ROBOTS_TXT = `User-agent: *
Disallow: /api/*
Disallow: /_emdash/

Sitemap: https://edwardvaisman.ca/sitemap-index.xml
`;

const seed = {
  version: "1" as const,
  meta: {
    name: "personal-website blog",
    description: "Blog posts migrated from src/content/blog markdown files",
    author: "Edward Vaisman",
  },
  settings: {
    title: "Edward Vaisman - Software Engineer",
    url: "https://edwardvaisman.ca",
    // Served by EmDash's injected /robots.txt route; replaces the old
    // src/pages/robots.txt.ts (route collision). The sitemap-index.xml is
    // still generated at build time by @astrojs/sitemap.
    seo: { robotsTxt: ROBOTS_TXT },
  },
  collections: [
    {
      slug: "posts",
      label: "Posts",
      labelSingular: "Post",
      supports: ["drafts", "revisions"] as ("drafts" | "revisions")[],
      fields: [
        {
          slug: "title",
          label: "Title",
          type: "string" as const,
          required: true,
        },
        {
          slug: "date",
          label: "Date",
          type: "datetime" as const,
          required: true,
        },
        {
          slug: "preview",
          label: "Preview",
          type: "text" as const,
          required: true,
        },
        {
          slug: "content",
          label: "Content",
          type: "portableText" as const,
          required: true,
        },
      ],
    },
  ],
  taxonomies: [
    {
      name: "tag",
      label: "Tags",
      labelSingular: "Tag",
      hierarchical: false,
      collections: ["posts"],
      terms: [...tagSlugs].sort().map((slug) => ({ slug, label: slug })),
    },
  ],
  content: { posts: entries },
};

const result = validateSeed(seed);
if (!result.valid) {
  console.error("Seed validation failed:");
  for (const error of result.errors ?? []) {
    console.error(" -", error);
  }
  process.exit(1);
}
for (const warning of result.warnings ?? []) {
  console.warn("Seed warning:", warning);
}

fs.mkdirSync(path.dirname(SEED_PATH), { recursive: true });
fs.writeFileSync(SEED_PATH, `${JSON.stringify(seed, null, 2)}\n`);
console.log(
  `Wrote ${SEED_PATH} (${entries.length} posts, ${tagSlugs.size} tags)`
);
