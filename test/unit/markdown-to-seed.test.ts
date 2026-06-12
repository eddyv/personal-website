import { describe, expect, it } from "vitest";
import {
  markdownToPost,
  type PortableTextCodeBlock,
  type PortableTextHtmlBlock,
  type PortableTextImageBlock,
  type PortableTextTextBlock,
} from "../../scripts/markdown-to-seed/convert";

const FRONTMATTER = `---
title: "A Test Post"
date: 2025-03-25
preview: "A preview line."
tags: ["alpha", "beta"]
---

`;

const convert = (body: string) => markdownToPost(FRONTMATTER + body, "test");
const UNSUPPORTED_PATTERN = /Unsupported/;

describe("markdownToPost frontmatter", () => {
  it("maps title, preview, tags and UTC-midnight date", () => {
    const { frontmatter } = convert("Hello.");
    expect(frontmatter.title).toBe("A Test Post");
    expect(frontmatter.preview).toBe("A preview line.");
    expect(frontmatter.tags).toEqual(["alpha", "beta"]);
    expect(frontmatter.date.toISOString()).toBe("2025-03-25T00:00:00.000Z");
    expect(frontmatter.draft).toBe(false);
  });
});

describe("markdownToPost blocks", () => {
  it("converts heading depths to styles", () => {
    const { blocks } = convert("# One\n\n## Two\n\n### Three");
    const styles = blocks.map((b) => (b as PortableTextTextBlock).style);
    expect(styles).toEqual(["h1", "h2", "h3"]);
  });

  it("converts inline marks and links", () => {
    const { blocks } = convert(
      "Some **bold** and *italic* and `code` and [a link](https://example.com)."
    );
    const block = blocks[0] as PortableTextTextBlock;

    const findSpan = (text: string) =>
      block.children.find((span) => span.text === text);
    expect(findSpan("bold")?.marks).toEqual(["strong"]);
    expect(findSpan("italic")?.marks).toEqual(["em"]);
    expect(findSpan("code")?.marks).toEqual(["code"]);

    expect(block.markDefs).toHaveLength(1);
    expect(block.markDefs[0].href).toBe("https://example.com");
    expect(findSpan("a link")?.marks).toEqual([block.markDefs[0]._key]);
  });

  it("converts ordered and unordered lists", () => {
    const { blocks } = convert(
      "1. first\n2. second\n\n- bullet one\n- bullet two"
    );
    const listBlocks = blocks as PortableTextTextBlock[];
    expect(listBlocks.map((b) => b.listItem)).toEqual([
      "number",
      "number",
      "bullet",
      "bullet",
    ]);
    expect(listBlocks.every((b) => b.level === 1)).toBe(true);
    expect(listBlocks[0].children[0].text).toBe("first");
  });

  it("converts blockquotes", () => {
    const { blocks } = convert("> quoted *wisdom*");
    const block = blocks[0] as PortableTextTextBlock;
    expect(block.style).toBe("blockquote");
    expect(block.children.at(-1)?.marks).toEqual(["em"]);
  });

  it("converts fenced code blocks with language", () => {
    const { blocks } = convert(
      "```typescript\nexport enum ToolName {\n  LIST = 'list',\n}\n```"
    );
    const block = blocks[0] as PortableTextCodeBlock;
    expect(block._type).toBe("code");
    expect(block.language).toBe("typescript");
    expect(block.code).toContain("export enum ToolName");
  });

  it("converts standalone images preserving the public URL", () => {
    const { blocks } = convert("![An alt text](/blog/some-post/picture.png)");
    const block = blocks[0] as PortableTextImageBlock;
    expect(block._type).toBe("image");
    expect(block.asset.url).toBe("/blog/some-post/picture.png");
    expect(block.asset._ref).toBe("picture.png");
    expect(block.alt).toBe("An alt text");
  });

  it("converts thematic breaks to hr html blocks", () => {
    const { blocks } = convert("above\n\n---\n\nbelow");
    const block = blocks[1] as PortableTextHtmlBlock;
    expect(block._type).toBe("htmlBlock");
    expect(block.html).toBe("<hr/>");
  });

  it("produces deterministic keys across runs", () => {
    const body = "# Title\n\nSome **text** with [link](https://x.dev).";
    const first = convert(body);
    const second = convert(body);
    expect(first.blocks).toEqual(second.blocks);
  });

  it("throws on unsupported nodes", () => {
    expect(() => convert("<div>raw html</div>")).toThrow(UNSUPPORTED_PATTERN);
  });
});
