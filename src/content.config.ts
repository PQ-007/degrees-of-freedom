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

// Every factual claim's sources (cited in pages as [@id]).
const sources = defineCollection({
  loader: file("content/sources.yaml"),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    claim: z.string().min(1),
    sources: z
      .array(z.object({ title: z.string().min(1), url: z.url() }))
      .min(1),
    checked: z
      .string()
      .regex(
        /\d{4}-\d{2}-\d{2}/,
        "say how and when it was checked, with a date",
      ),
    uncertain: z
      .object({ en: z.string().min(1), mn: z.string().min(1) })
      .optional(),
  }),
});

export const collections = { tree, nodes, sources };
