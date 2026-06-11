import { z } from "astro/zod";

export const blogSchema = z.object({
  title: z.string(),
  date: z.date(),
  preview: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogSchema>;
