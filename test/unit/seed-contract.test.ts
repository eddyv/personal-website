import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { expectedPosts } from "../fixtures/expected-posts";

interface SeedPost {
  slug: string;
  status: string;
  data: {
    title: string;
    date: string;
    preview: string;
    content: { _type: string }[];
  };
}

interface Seed {
  version: string;
  collections: { slug: string }[];
  content: { posts: SeedPost[] };
  settings?: { seo?: { robotsTxt?: string } };
}

const BLOG_PATH_PATTERN = /^\/blog\//;

const seed = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), ".emdash/seed.json"), "utf8")
) as Seed;

describe("emdash seed contract", () => {
  it("defines the posts collection", () => {
    expect(seed.collections.map((c) => c.slug)).toContain("posts");
  });

  it("contains the expected posts as published entries", () => {
    const bySlug = new Map(seed.content.posts.map((p) => [p.slug, p]));

    for (const expected of expectedPosts) {
      const post = bySlug.get(expected.slug);
      expect(post, `seed is missing post ${expected.slug}`).toBeDefined();
      expect(post?.status).toBe("published");
      expect(post?.data.title).toBe(expected.title);
      expect(new Date(post?.data.date ?? "").getFullYear()).toBe(expected.year);
      expect(post?.data.content.length).toBeGreaterThan(0);
    }

    expect(seed.content.posts).toHaveLength(expectedPosts.length);
  });

  it("keeps blog images served from the public directory", () => {
    const imageBlocks = seed.content.posts.flatMap((post) =>
      post.data.content.filter((block) => block._type === "image")
    ) as unknown as { asset: { url: string } }[];

    expect(imageBlocks.length).toBeGreaterThan(0);
    for (const block of imageBlocks) {
      expect(block.asset.url).toMatch(BLOG_PATH_PATTERN);
    }
  });

  it("serves the robots policy via seed settings", () => {
    expect(seed.settings?.seo?.robotsTxt).toContain("Disallow: /api/*");
    expect(seed.settings?.seo?.robotsTxt).toContain(
      "Sitemap: https://edwardvaisman.ca/sitemap-index.xml"
    );
  });
});
