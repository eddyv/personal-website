import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { blogSchema } from "../../src/content/blog-schema";
import { expectedPosts } from "../fixtures/expected-posts";

const MD_EXTENSION = /\.md$/;

const validFrontmatter = {
  title: "A Post",
  date: new Date("2025-03-25"),
  preview: "A preview",
  tags: ["tag-one"],
  draft: false,
};

describe("blogSchema", () => {
  it("parses valid frontmatter", () => {
    const parsed = blogSchema.parse(validFrontmatter);
    expect(parsed.title).toBe("A Post");
    expect(parsed.date).toEqual(new Date("2025-03-25"));
    expect(parsed.tags).toEqual(["tag-one"]);
  });

  it("defaults tags to an empty array", () => {
    const { tags: _tags, ...withoutTags } = validFrontmatter;
    const parsed = blogSchema.parse(withoutTags);
    expect(parsed.tags).toEqual([]);
  });

  it("defaults draft to false", () => {
    const { draft: _draft, ...withoutDraft } = validFrontmatter;
    const parsed = blogSchema.parse(withoutDraft);
    expect(parsed.draft).toBe(false);
  });

  it("rejects frontmatter without a title", () => {
    const { title: _title, ...withoutTitle } = validFrontmatter;
    expect(() => blogSchema.parse(withoutTitle)).toThrow();
  });

  it("rejects a non-date date", () => {
    expect(() =>
      blogSchema.parse({ ...validFrontmatter, date: "2025-03-25" })
    ).toThrow();
  });
});

describe("blog content contract", () => {
  it("post files match the expected slugs in the content directory", () => {
    const blogDir = path.join(process.cwd(), "src/content/blog");
    const slugs = fs
      .readdirSync(blogDir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(MD_EXTENSION, ""))
      .sort();

    const expectedSlugs = expectedPosts.map((post) => post.slug).sort();
    expect(slugs).toEqual(expectedSlugs);
  });
});
