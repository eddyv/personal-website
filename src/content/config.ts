import { defineCollection } from "astro:content";
import { blogSchema } from "./blog-schema";

const blog = defineCollection({
  type: "content",
  schema: blogSchema,
});

export const collections = { blog };
