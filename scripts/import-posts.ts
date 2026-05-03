import { Database } from "bun:sqlite";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { marked, type Tokens } from "marked";

type PTSpan = {
  _type: "span";
  _key: string;
  text: string;
  marks?: string[];
};

type PTMarkDef = {
  _type: "link";
  _key: string;
  href: string;
};

type PTBlock = {
  _type: "block";
  _key: string;
  style?: "normal" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote";
  level?: number;
  listItem?: "bullet" | "number";
  markDefs: PTMarkDef[];
  children: PTSpan[];
};

type PTCodeBlock = {
  _type: "code";
  _key: string;
  language?: string;
  code: string;
};

type PTImageBlock = {
  _type: "image";
  _key: string;
  asset: { url: string };
  alt?: string;
};

type PTAny = PTBlock | PTCodeBlock | PTImageBlock;

let keyCounter = 0;
const key = () => `k${++keyCounter}`;

function inlineToSpans(tokens: Tokens.Generic[]): {
  spans: PTSpan[];
  markDefs: PTMarkDef[];
} {
  const spans: PTSpan[] = [];
  const markDefs: PTMarkDef[] = [];

  const visit = (toks: Tokens.Generic[], marks: string[]) => {
    for (const tok of toks) {
      switch (tok.type) {
        case "text": {
          const t = tok as Tokens.Text;
          if (t.tokens) {
            visit(t.tokens, marks);
          } else {
            spans.push({
              _type: "span",
              _key: key(),
              text: t.text,
              marks: marks.length ? [...marks] : undefined,
            });
          }
          break;
        }
        case "strong":
          visit((tok as Tokens.Strong).tokens, [...marks, "strong"]);
          break;
        case "em":
          visit((tok as Tokens.Em).tokens, [...marks, "em"]);
          break;
        case "codespan":
          spans.push({
            _type: "span",
            _key: key(),
            text: (tok as Tokens.Codespan).text,
            marks: [...marks, "code"],
          });
          break;
        case "link": {
          const l = tok as Tokens.Link;
          const markKey = key();
          markDefs.push({ _type: "link", _key: markKey, href: l.href });
          visit(l.tokens, [...marks, markKey]);
          break;
        }
        case "br":
          spans.push({
            _type: "span",
            _key: key(),
            text: "\n",
            marks: marks.length ? [...marks] : undefined,
          });
          break;
        case "del":
          visit((tok as Tokens.Del).tokens, [...marks, "strike-through"]);
          break;
        default: {
          const anyTok = tok as { text?: unknown };
          if (typeof anyTok.text === "string") {
            spans.push({
              _type: "span",
              _key: key(),
              text: anyTok.text,
              marks: marks.length ? [...marks] : undefined,
            });
          }
        }
      }
    }
  };

  visit(tokens, []);
  for (const s of spans) {
    if (!s.marks) {
      delete s.marks;
    }
  }
  return { spans, markDefs };
}

function tokensToBlocks(tokens: Tokens.Generic[]): PTAny[] {
  const blocks: PTAny[] = [];

  for (const tok of tokens) {
    switch (tok.type) {
      case "heading": {
        const h = tok as Tokens.Heading;
        const { spans, markDefs } = inlineToSpans(h.tokens);
        blocks.push({
          _type: "block",
          _key: key(),
          style: `h${h.depth}` as PTBlock["style"],
          markDefs,
          children: spans,
        });
        break;
      }
      case "paragraph": {
        const p = tok as Tokens.Paragraph;
        if (p.tokens.length === 1 && p.tokens[0].type === "image") {
          const img = p.tokens[0] as Tokens.Image;
          blocks.push({
            _type: "image",
            _key: key(),
            asset: { url: img.href },
            alt: img.text || undefined,
          });
          break;
        }
        const { spans, markDefs } = inlineToSpans(p.tokens);
        blocks.push({
          _type: "block",
          _key: key(),
          style: "normal",
          markDefs,
          children: spans,
        });
        break;
      }
      case "code": {
        const c = tok as Tokens.Code;
        blocks.push({
          _type: "code",
          _key: key(),
          language: c.lang || undefined,
          code: c.text,
        });
        break;
      }
      case "list": {
        const l = tok as Tokens.List;
        const listItem: "bullet" | "number" = l.ordered ? "number" : "bullet";
        for (const item of l.items) {
          const { spans, markDefs } = inlineToSpans(item.tokens);
          blocks.push({
            _type: "block",
            _key: key(),
            style: "normal",
            level: 1,
            listItem,
            markDefs,
            children: spans,
          });
        }
        break;
      }
      case "blockquote": {
        const bq = tok as Tokens.Blockquote;
        const inner = tokensToBlocks(bq.tokens);
        for (const b of inner) {
          if (b._type === "block") {
            b.style = "blockquote";
          }
        }
        blocks.push(...inner);
        break;
      }
      case "hr":
      case "space":
        break;
      default: {
        const anyTok = tok as { text?: unknown };
        if (typeof anyTok.text === "string") {
          blocks.push({
            _type: "block",
            _key: key(),
            style: "normal",
            markDefs: [],
            children: [{ _type: "span", _key: key(), text: anyTok.text }],
          });
        }
      }
    }
  }
  return blocks;
}

function parseFrontmatter(raw: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!match) {
    return { meta: {}, body: raw };
  }
  const [, fm, body] = match;
  const meta: Record<string, unknown> = {};

  for (const line of fm.split("\n")) {
    const m = /^([^:]+):\s*(.*)$/.exec(line);
    if (!m) {
      continue;
    }
    const k = m[1].trim();
    let v: string = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }

    if (k === "tags") {
      meta.tags = v
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (k === "draft") {
      meta.draft = v === "true";
    } else if (k === "date") {
      meta.date = new Date(v).toISOString();
    } else {
      meta[k] = v;
    }
  }
  return { meta, body };
}

const blogDir = "src/content/blog";
const files = readdirSync(blogDir).filter((f) => extname(f) === ".md");

const posts = files.map((f) => {
  const raw = readFileSync(join(blogDir, f), "utf-8");
  const { meta, body } = parseFrontmatter(raw);
  const slug = basename(f, ".md");
  const tokens = marked.lexer(body);
  const blocks = tokensToBlocks(tokens);

  return {
    id: slug,
    slug,
    status: meta.draft ? "draft" : "published",
    publishedAt: meta.date,
    data: {
      title: meta.title,
      excerpt: meta.preview,
      body: blocks,
    },
    taxonomies: {
      tag: (meta.tags as string[]) ?? [],
    },
  };
});

const seed = {
  $schema: "https://emdashcms.com/seed.schema.json",
  version: "1",
  meta: {
    name: "Initial blog posts",
    description:
      "Seed generated from src/content/blog markdown for the EmDash migration.",
  },
  collections: [
    {
      slug: "posts",
      label: "Posts",
      labelSingular: "Post",
      description: "Blog posts",
      icon: "file-text",
      supports: ["drafts", "revisions"],
      fields: [
        { slug: "title", label: "Title", type: "string", required: true },
        { slug: "excerpt", label: "Excerpt", type: "text" },
        { slug: "body", label: "Content", type: "portableText" },
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
    },
  ],
  content: { posts },
};

mkdirSync("seeds", { recursive: true });
writeFileSync("seeds/initial-posts.json", `${JSON.stringify(seed, null, 2)}\n`);
console.log(`Wrote ${posts.length} posts to seeds/initial-posts.json`);

const dbPath = process.argv[2] ?? "./data.db";
try {
  const db = new Database(dbPath);
  const stmt = db.prepare(
    "UPDATE ec_posts SET published_at = ? WHERE slug = ?"
  );
  let updated = 0;
  for (const p of posts) {
    const result = stmt.run(p.publishedAt as string, p.slug);
    if (result.changes > 0) {
      updated += 1;
    }
  }
  db.close();
  console.log(
    `Backdated published_at on ${updated} post(s) in ${dbPath}. Run after \`bunx emdash seed\` so the SQL fix-up sees the seeded rows.`
  );
} catch (err) {
  console.warn(
    `Skipped backdate step (${(err as Error).message}). Apply seeds/initial-posts.json first, then re-run this script with the database path.`
  );
}
