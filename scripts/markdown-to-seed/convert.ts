import type {
  Blockquote,
  Code,
  Heading,
  List,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";

export interface PortableTextSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

export interface PortableTextMarkDef {
  _type: "link";
  _key: string;
  href: string;
}

export interface PortableTextTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote";
  children: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
  listItem?: "bullet" | "number";
  level?: number;
}

export interface PortableTextImageBlock {
  _type: "image";
  _key: string;
  asset: {
    _ref: string;
    url: string;
  };
  alt: string;
}

export interface PortableTextCodeBlock {
  _type: "code";
  _key: string;
  code: string;
  language?: string;
}

export interface PortableTextHtmlBlock {
  _type: "htmlBlock";
  _key: string;
  html: string;
}

export type PortableTextBlock =
  | PortableTextTextBlock
  | PortableTextImageBlock
  | PortableTextCodeBlock
  | PortableTextHtmlBlock;

export interface PostFrontmatter {
  title: string;
  date: Date;
  preview: string;
  tags: string[];
  draft?: boolean;
}

export interface ConvertedPost {
  frontmatter: PostFrontmatter;
  blocks: PortableTextBlock[];
}

interface SpanState {
  keyPrefix: string;
  spanIndex: number;
  markDefs: PortableTextMarkDef[];
}

const HEADING_STYLES = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function collectSpans(
  nodes: PhrasingContent[],
  marks: string[],
  state: SpanState
): PortableTextSpan[] {
  const spans: PortableTextSpan[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "text":
        spans.push({
          _type: "span",
          _key: `${state.keyPrefix}-s${state.spanIndex++}`,
          text: node.value,
          marks: [...marks],
        });
        break;
      case "strong":
        spans.push(...collectSpans(node.children, [...marks, "strong"], state));
        break;
      case "emphasis":
        spans.push(...collectSpans(node.children, [...marks, "em"], state));
        break;
      case "inlineCode":
        spans.push({
          _type: "span",
          _key: `${state.keyPrefix}-s${state.spanIndex++}`,
          text: node.value,
          marks: [...marks, "code"],
        });
        break;
      case "delete":
        spans.push(
          ...collectSpans(node.children, [...marks, "strike-through"], state)
        );
        break;
      case "link": {
        const markDef: PortableTextMarkDef = {
          _type: "link",
          _key: `${state.keyPrefix}-l${state.markDefs.length}`,
          href: node.url,
        };
        state.markDefs.push(markDef);
        spans.push(
          ...collectSpans(node.children, [...marks, markDef._key], state)
        );
        break;
      }
      case "break":
        spans.push({
          _type: "span",
          _key: `${state.keyPrefix}-s${state.spanIndex++}`,
          text: "\n",
          marks: [...marks],
        });
        break;
      default:
        throw new Error(
          `Unsupported inline markdown node: ${node.type} (${JSON.stringify(node).slice(0, 120)})`
        );
    }
  }

  return spans;
}

function textBlock(
  nodes: PhrasingContent[],
  style: PortableTextTextBlock["style"],
  key: string,
  listInfo?: { listItem: "bullet" | "number"; level: number }
): PortableTextTextBlock {
  const state: SpanState = { keyPrefix: key, spanIndex: 0, markDefs: [] };
  const children = collectSpans(nodes, [], state);
  return {
    _type: "block",
    _key: key,
    style,
    children,
    markDefs: state.markDefs,
    ...(listInfo ?? {}),
  };
}

function imageBlocksFromParagraph(
  node: Paragraph,
  key: string
): PortableTextImageBlock[] | null {
  const images = node.children.filter((child) => child.type === "image");
  if (images.length === 0) {
    return null;
  }

  const nonImageText = node.children.some(
    (child) => child.type === "text" && child.value.trim() !== ""
  );
  if (nonImageText) {
    throw new Error(
      `Paragraph mixes text and images - not supported: ${JSON.stringify(node).slice(0, 160)}`
    );
  }

  return images.map((img, i) => {
    const filename = img.url.split("/").pop() ?? img.url;
    return {
      _type: "image",
      _key: `${key}-i${i}`,
      // `url` is passed through untouched by EmDash's Image component for
      // non-internal URLs, so images keep serving from public/blog/.
      asset: { _ref: filename, url: img.url },
      alt: img.alt ?? "",
    };
  });
}

function convertList(
  node: List,
  key: string,
  level: number
): PortableTextTextBlock[] {
  const blocks: PortableTextTextBlock[] = [];
  const listItem = node.ordered ? "number" : "bullet";

  node.children.forEach((item, i) => {
    item.children.forEach((child, j) => {
      const childKey = `${key}-li${i}-${j}`;
      if (child.type === "paragraph") {
        blocks.push(
          textBlock(child.children, "normal", childKey, { listItem, level })
        );
      } else if (child.type === "list") {
        blocks.push(...convertList(child, childKey, level + 1));
      } else {
        throw new Error(`Unsupported list item child: ${child.type}`);
      }
    });
  });

  return blocks;
}

function convertBlockquote(
  node: Blockquote,
  key: string
): PortableTextTextBlock[] {
  return node.children.map((child, i) => {
    if (child.type !== "paragraph") {
      throw new Error(`Unsupported blockquote child: ${child.type}`);
    }
    return textBlock(child.children, "blockquote", `${key}-q${i}`);
  });
}

function convertNode(node: RootContent, key: string): PortableTextBlock[] {
  switch (node.type) {
    case "yaml":
      return [];
    case "heading": {
      const heading = node as Heading;
      return [
        textBlock(heading.children, HEADING_STYLES[heading.depth - 1], key),
      ];
    }
    case "paragraph": {
      const paragraph = node as Paragraph;
      const images = imageBlocksFromParagraph(paragraph, key);
      if (images) {
        return images;
      }
      return [textBlock(paragraph.children, "normal", key)];
    }
    case "code": {
      const code = node as Code;
      return [
        {
          _type: "code",
          _key: key,
          code: code.value,
          ...(code.lang ? { language: code.lang } : {}),
        },
      ];
    }
    case "list":
      return convertList(node as List, key, 1);
    case "blockquote":
      return convertBlockquote(node as Blockquote, key);
    case "thematicBreak":
      return [{ _type: "htmlBlock", _key: key, html: "<hr/>" }];
    default:
      throw new Error(`Unsupported markdown block node: ${node.type}`);
  }
}

export function markdownToPost(markdown: string, slug: string): ConvertedPost {
  const tree = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .parse(markdown) as Root;

  const yamlNode = tree.children.find((node) => node.type === "yaml");
  if (!yamlNode || yamlNode.type !== "yaml") {
    throw new Error(`Post ${slug} is missing YAML frontmatter`);
  }

  const raw = parseYaml(yamlNode.value) as Record<string, unknown>;
  if (typeof raw.title !== "string" || typeof raw.preview !== "string") {
    throw new Error(`Post ${slug} frontmatter is missing title/preview`);
  }
  // YAML 1.2 parses bare dates as strings; new Date("YYYY-MM-DD") is UTC
  // midnight, matching what Astro's zod date coercion produced.
  const date = raw.date instanceof Date ? raw.date : new Date(String(raw.date));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Post ${slug} frontmatter date is not a date`);
  }

  const frontmatter: PostFrontmatter = {
    title: raw.title,
    date,
    preview: raw.preview,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    draft: raw.draft === true,
  };

  const blocks: PortableTextBlock[] = [];
  tree.children.forEach((node, index) => {
    blocks.push(...convertNode(node, `${slug}-b${index}`));
  });

  return { frontmatter, blocks };
}
