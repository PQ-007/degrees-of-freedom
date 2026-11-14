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

// Compare pages: the table (one YAML per page, every language inside) and the
// prose per language (content/compare/<lang>/<slug>.md).
const localized = z.record(z.string(), z.string());
const compareTables = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "content/compare" }),
  schema: z.object({
    id: z.string().regex(/^X\d+$/),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    nodes: z.array(z.string()),
    columns: z.array(
      z.object({
        key: z.string(),
        type: z.enum(["rating", "text"]),
        label: localized,
      }),
    ),
    rows: z.array(
      z.object({
        key: z.string(),
        name: localized,
        values: z.record(z.string(), z.union([z.number(), localized])),
      }),
    ),
  }),
});
const comparePages = defineCollection({
  loader: glob({
    pattern: "*/*.md",
    base: "content/compare",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({ title: z.string().min(1), summary: z.string().min(1) }),
});

// Robot teardowns: the language-independent data (drawing, callouts) and the
// text per language (content/robots/<lang>/<slug>.md, the 12 template sections).
const robotData = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "content/robots" }),
  schema: z.object({
    id: z.string().regex(/^R\d+$/),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    figure: z.string().regex(/\.svg$/),
    nodes: z.array(z.string()),
    callouts: z.array(
      z.object({
        n: z.number().int(),
        role: z.enum(["sense", "think", "act", "none"]),
        node: z.string(),
        section: z.string(),
        label: localized,
      }),
    ),
  }),
});
const robotPages = defineCollection({
  loader: glob({
    pattern: "*/*.md",
    base: "content/robots",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    figureAlt: z.string().min(1),
    glance: z
      .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
      .min(1),
  }),
});

// Roadmaps: the ordered path (one YAML, every language inside) and the text
// per language (content/roadmaps/<lang>/<slug>.md).
const roadmapData = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "content/roadmaps" }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    robot: z.string().optional(),
    build: z.string().optional(),
    stages: z.array(
      z.object({
        key: z.string(),
        title: localized,
        steps: z.array(
          z.object({
            node: z.string(),
            level: z.enum(["must", "helpful"]),
            why: localized,
          }),
        ),
      }),
    ),
    later: z.array(z.object({ node: z.string(), why: localized })),
  }),
});
const roadmapPages = defineCollection({
  loader: glob({
    pattern: "*/*.md",
    base: "content/roadmaps",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({ title: z.string().min(1), summary: z.string().min(1) }),
});

// Builds: the spec card, diagram and steps (one YAML, every language inside)
// and the text per language (content/builds/<lang>/<slug>.md).
const buildData = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "content/builds" }),
  schema: z.object({
    id: z.string().regex(/^B\d\d$/),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    difficulty: z.number().int(),
    time: localized,
    nodes: z.array(z.string()),
    robot: z.string().optional(),
    parts: z.array(
      z.object({
        node: z.string(),
        compare: z.string().optional(),
        name: localized,
      }),
    ),
    diagram: z.object({
      sense: z.array(localized),
      think: z.array(localized),
      act: z.array(localized),
      power: z.array(localized),
    }),
    stages: z.array(
      z.object({
        key: z.string(),
        title: localized,
        steps: z.array(
          z.object({ node: z.string().optional(), text: localized }),
        ),
      }),
    ),
  }),
});
const buildPages = defineCollection({
  loader: glob({
    pattern: "*/*.md",
    base: "content/builds",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({ title: z.string().min(1), summary: z.string().min(1) }),
});

// The signal chain: the stages (one YAML, every language inside) and the text
// around them per language (content/signal-chain/<lang>.md).
const chainStages = defineCollection({
  loader: file("content/signal-chain/stages.yaml"),
  schema: z.object({
    id: z.string(),
    role: z.enum(["sense", "think", "act"]),
    node: z.string(),
    name: localized,
    in: localized,
    out: localized,
    text: localized,
  }),
});
const chainPages = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: "content/signal-chain",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({ title: z.string().min(1), summary: z.string().min(1) }),
});

export const collections = {
  tree,
  nodes,
  sources,
  compareTables,
  comparePages,
  robotData,
  robotPages,
  roadmapData,
  roadmapPages,
  buildData,
  buildPages,
  chainStages,
  chainPages,
};
