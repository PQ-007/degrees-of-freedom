import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

// The tech tree's structure: one entry per node, language-independent.
const tree = defineCollection({
  loader: file("content/tree/nodes.yaml"),
  schema: z.object({
    id: z
      .string()
      .regex(/^[FCLMPIS]\d+$/, "an ID is a tier letter and a number, e.g. M5"),
    tier: z.number().int().min(0).max(6),
    slug: z
      .string()
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "a slug is lowercase words joined by -",
      ),
    needs: z.array(z.string()),
  }),
});

// Each node's page per language: content/nodes/<lang>/<ID>-<slug>.md.
// The entry ID keeps the path as written ("en/M5-classical-control").
const nodes = defineCollection({
  loader: glob({
    pattern: "*/*.md",
    base: "content/nodes",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
  }),
});

export const collections = { tree, nodes };
