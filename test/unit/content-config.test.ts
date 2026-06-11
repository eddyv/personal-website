import { describe, expect, it } from "vitest";
import { blogSchema } from "../../src/content/blog-schema";
import { collections } from "../../src/content.config";

describe("content config", () => {
  it("defines the blog collection with a loader, not the legacy type", () => {
    expect(collections.blog).toBeDefined();
    const blog = collections.blog as unknown as Record<string, unknown>;
    expect(blog.loader).toBeTypeOf("object");
    expect(blog.type).not.toBe("content");
  });

  it("reuses the shared blog schema", () => {
    const blog = collections.blog as unknown as Record<string, unknown>;
    expect(blog.schema).toBe(blogSchema);
  });
});
