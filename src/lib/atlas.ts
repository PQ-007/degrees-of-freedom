// Loads the tech tree and its pages from the content collections, checks them
// (src/lib/tree.ts) and fails the build with every problem listed.
import { getCollection, type CollectionEntry } from "astro:content";
import { languages, localePath, type Lang } from "./i18n";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { checkBuild, type Build } from "./builds";
import { checkChain, type Stage } from "./chain";
import { checkCompare, type CompareTable } from "./compare";
import { checkHardware, figureName, type HardwareCategory } from "./hardware";
import {
  checkGlossary,
  groupByTier,
  termLinks,
  type Term,
  type TierGroup,
} from "./glossary";
import { checkRoadmap, type Roadmap } from "./roadmaps";
import { checkRobot, type RobotData } from "./robots";
import { checkTree, compareIds, usedBy, type TreeNode } from "./tree";

export interface AtlasNode extends TreeNode {
  title: string;
  summary: string;
  usedBy: string[];
  url: string;
  entry: CollectionEntry<"nodes">;
}

let checked:
  Promise<{ nodes: TreeNode[]; pages: CollectionEntry<"nodes">[] }> | undefined;

function load() {
  checked ??= (async () => {
    const nodes = (await getCollection("tree"))
      .map((e) => e.data)
      .sort((a, b) => compareIds(a.id, b.id));
    const pages = await getCollection("nodes");
    const split = pages.map((p) => {
      const [lang = "", file = ""] = p.id.split("/");
      return { lang, file };
    });
    const errors = checkTree(nodes, split, languages);
    if (errors.length > 0) {
      throw new Error(
        `The tech tree has ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return { nodes, pages };
  })();
  return checked;
}

/** Every node, in ID order, with its text in `lang`. */
export async function getAtlas(lang: Lang): Promise<AtlasNode[]> {
  const { nodes, pages } = await load();
  const users = usedBy(nodes);
  const base = import.meta.env.BASE_URL;
  return nodes.map((n) => {
    const entry = pages.find((p) => p.id === `${lang}/${n.id}-${n.slug}`);
    if (!entry) throw new Error(`${n.id} has no ${lang} page`); // checkTree already rules this out
    return {
      ...n,
      title: entry.data.title,
      summary: entry.data.summary,
      usedBy: users.get(n.id) ?? [],
      url: localePath(base, lang, `node/${n.slug}/`),
      entry,
    };
  });
}

let comparesChecked: Promise<CompareTable[]> | undefined;

/** Every compare table, checked, in ID order. */
function loadCompares() {
  comparesChecked ??= (async () => {
    const { nodes } = await load();
    const tables = (await getCollection("compareTables"))
      .map((e) => e.data as CompareTable)
      .sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
    const nodeIds = new Set(nodes.map((n) => n.id));
    const errors = tables.flatMap((table) =>
      checkCompare(table, nodeIds, languages),
    );
    if (errors.length > 0) {
      throw new Error(
        `The compare tables have ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return tables;
  })();
  return comparesChecked;
}

export interface HardwareTypePage {
  key: string;
  node: string;
  title: string;
  summary: string;
  figureAlt: string;
  /** The drawing's SVG markup (inlined, so it follows the theme). */
  svg: string;
  url: string;
  entry: CollectionEntry<"hardwareTypes">;
}

export interface HardwarePage {
  data: HardwareCategory;
  /** The compare table folded into each type's page, if any. */
  table: CompareTable | undefined;
  title: string;
  summary: string;
  /** The category's row on the Hardware page. */
  url: string;
  entry: CollectionEntry<"hardwarePages">;
  types: HardwareTypePage[];
}

let hardwareChecked:
  | Promise<{
      categories: HardwareCategory[];
      tables: Map<string, CompareTable>;
      pages: CollectionEntry<"hardwarePages">[];
      typePages: CollectionEntry<"hardwareTypes">[];
      svgs: Map<string, string>;
    }>
  | undefined;

function loadHardware() {
  hardwareChecked ??= (async () => {
    const { nodes } = await load();
    const tables = new Map((await loadCompares()).map((t) => [t.id, t]));
    const categories = (await getCollection("hardwareData"))
      .map((e) => e.data as HardwareCategory)
      .sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
    const pages = await getCollection("hardwarePages");
    const typePages = await getCollection("hardwareTypes");
    const svgs = new Map<string, string>();
    for (const f of readdirSync(join(process.cwd(), "content/figures"))) {
      if (f.endsWith(".svg"))
        svgs.set(
          f.slice(0, -4),
          readFileSync(join(process.cwd(), "content/figures", f), "utf8"),
        );
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    const errors = categories.flatMap((cat) =>
      checkHardware(
        cat,
        nodeIds,
        tables,
        languages,
        pages
          .filter((p) => p.id.endsWith(`/${cat.slug}`))
          .map((p) => p.id.split("/")[0] ?? ""),
        typePages
          .filter((p) => p.id.split("/")[1] === cat.slug)
          .map((p) => {
            const [lang = "", , key = ""] = p.id.split("/");
            return { lang, key, body: p.body ?? "" };
          }),
        new Set(svgs.keys()),
      ),
    );
    for (const id of tables.keys()) {
      if (!categories.some((c) => c.compare === id))
        errors.push(
          `compare table ${id} isn't shown on any Hardware page: add compare: ${id} to a category`,
        );
    }
    if (errors.length > 0) {
      throw new Error(
        `The Hardware pages have ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return { categories, tables, pages, typePages, svgs };
  })();
  return hardwareChecked;
}

/** Every Hardware category, in ID order, with its types, in `lang`. */
export async function getHardware(lang: Lang): Promise<HardwarePage[]> {
  const { categories, tables, pages, typePages, svgs } = await loadHardware();
  const base = import.meta.env.BASE_URL;
  return categories.map((data) => {
    const entry = pages.find((p) => p.id === `${lang}/${data.slug}`);
    if (!entry) throw new Error(`${data.id} has no ${lang} page`); // checkHardware rules this out
    const types = data.types.map((t) => {
      const page = typePages.find(
        (p) => p.id === `${lang}/${data.slug}/${t.key}`,
      );
      if (!page) throw new Error(`${t.key} has no ${lang} page`); // ruled out too
      return {
        key: t.key,
        node: t.node,
        title: page.data.title,
        summary: page.data.summary,
        figureAlt: page.data.figureAlt,
        svg: svgs.get(figureName(t.key)) ?? "",
        url: localePath(base, lang, `hardware/${data.slug}/${t.key}/`),
        entry: page,
      };
    });
    return {
      data,
      table: data.compare ? tables.get(data.compare) : undefined,
      title: entry.data.title,
      summary: entry.data.summary,
      url: `${localePath(base, lang, "hardware/")}#${data.slug}`,
      entry,
      types,
    };
  });
}

/** Each Hardware type by key, with its category, in `lang`. */
export async function getHardwareTypes(lang: Lang) {
  const types = new Map<
    string,
    HardwareTypePage & { category: HardwarePage }
  >();
  for (const category of await getHardware(lang)) {
    for (const t of category.types) types.set(t.key, { ...t, category });
  }
  return types;
}

export interface RobotPage {
  data: RobotData;
  title: string;
  summary: string;
  figureAlt: string;
  glance: { label: string; value: string }[];
  /** The drawing's SVG markup (inlined, so it follows the theme's ink colour). */
  svg: string;
  url: string;
  entry: CollectionEntry<"robotPages">;
}

let robotsChecked:
  | Promise<{
      robots: RobotData[];
      svgs: Map<string, string>;
      pages: CollectionEntry<"robotPages">[];
    }>
  | undefined;

function readFigure(file: string): string | null {
  try {
    return readFileSync(join(process.cwd(), "content/robots", file), "utf8");
  } catch {
    return null;
  }
}

function loadRobots() {
  robotsChecked ??= (async () => {
    const { nodes } = await load();
    const robots = (await getCollection("robotData"))
      .map((e) => e.data as RobotData)
      .sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
    const pages = await getCollection("robotPages");
    const nodeIds = new Set(nodes.map((n) => n.id));
    const svgs = new Map<string, string>();
    const errors = robots.flatMap((robot) => {
      const svg = readFigure(robot.figure);
      if (svg) svgs.set(robot.slug, svg);
      const texts = pages
        .filter((p) => p.id.endsWith(`/${robot.slug}`))
        .map((p) => ({
          lang: p.id.split("/")[0] ?? "",
          body: p.body ?? "",
          glance: p.data.glance,
        }));
      return checkRobot(robot, svg, texts, nodeIds, languages);
    });
    if (errors.length > 0) {
      throw new Error(
        `The robot teardowns have ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return { robots, svgs, pages };
  })();
  return robotsChecked;
}

/** Every robot teardown, in ID order, with its text in `lang`. */
export async function getRobots(lang: Lang): Promise<RobotPage[]> {
  const { robots, svgs, pages } = await loadRobots();
  const base = import.meta.env.BASE_URL;
  return robots.map((data) => {
    const entry = pages.find((p) => p.id === `${lang}/${data.slug}`);
    if (!entry) throw new Error(`${data.id} has no ${lang} page`); // checkRobot already rules this out
    return {
      data,
      title: entry.data.title,
      summary: entry.data.summary,
      figureAlt: entry.data.figureAlt,
      glance: entry.data.glance,
      svg: svgs.get(data.slug) ?? "",
      url: localePath(base, lang, `robots/${data.slug}/`),
      entry,
    };
  });
}

export interface RoadmapPage {
  roadmap: Roadmap;
  title: string;
  summary: string;
  url: string;
  entry: CollectionEntry<"roadmapPages">;
}

let roadmapsChecked:
  | Promise<{ roadmaps: Roadmap[]; pages: CollectionEntry<"roadmapPages">[] }>
  | undefined;

function loadRoadmaps() {
  roadmapsChecked ??= (async () => {
    const { nodes } = await load();
    const { robots } = await loadRobots();
    const { builds } = await loadBuilds();
    const roadmaps = (await getCollection("roadmapData")).map(
      (e) => e.data as Roadmap,
    );
    const pages = await getCollection("roadmapPages");
    const needsOf = new Map(nodes.map((n) => [n.id, n.needs]));
    const robotIds = new Set(robots.map((r) => r.id));
    const buildIds = new Set(builds.map((b) => b.id));
    const errors = roadmaps.flatMap((r) =>
      checkRoadmap(
        r,
        needsOf,
        robotIds,
        buildIds,
        languages,
        pages
          .filter((p) => p.id.endsWith(`/${r.slug}`))
          .map((p) => p.id.split("/")[0] ?? ""),
      ),
    );
    if (errors.length > 0) {
      throw new Error(
        `The roadmaps have ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return { roadmaps, pages };
  })();
  return roadmapsChecked;
}

/** Every roadmap with its text in `lang`. */
export async function getRoadmaps(lang: Lang): Promise<RoadmapPage[]> {
  const { roadmaps, pages } = await loadRoadmaps();
  const base = import.meta.env.BASE_URL;
  return roadmaps.map((roadmap) => {
    const entry = pages.find((p) => p.id === `${lang}/${roadmap.slug}`);
    if (!entry) throw new Error(`roadmap ${roadmap.slug} has no ${lang} page`); // checkRoadmap rules this out
    return {
      roadmap,
      title: entry.data.title,
      summary: entry.data.summary,
      url: localePath(base, lang, `roadmaps/${roadmap.slug}/`),
      entry,
    };
  });
}

export interface BuildPage {
  build: Build;
  title: string;
  summary: string;
  /** The card's drawing, content/figures/build-<slug>.svg (inlined). */
  svg: string;
  url: string;
  entry: CollectionEntry<"buildPages">;
}

let buildsChecked:
  | Promise<{
      builds: Build[];
      pages: CollectionEntry<"buildPages">[];
      svgs: Map<string, string>;
    }>
  | undefined;

function loadBuilds() {
  buildsChecked ??= (async () => {
    const { nodes } = await load();
    const { robots } = await loadRobots();
    const { categories } = await loadHardware();
    const builds = (await getCollection("buildData"))
      .map((e) => e.data as Build)
      .sort((a, b) => a.id.localeCompare(b.id));
    const pages = await getCollection("buildPages");
    const ids = {
      nodes: new Set(nodes.map((n) => n.id)),
      hardware: new Set(categories.flatMap((c) => c.types.map((t) => t.key))),
      robots: new Set(robots.map((r) => r.id)),
    };
    const errors = builds.flatMap((b) =>
      checkBuild(
        b,
        ids,
        languages,
        pages
          .filter((p) => p.id.endsWith(`/${b.slug}`))
          .map((p) => p.id.split("/")[0] ?? ""),
      ),
    );
    // Each Build has a card drawing for the Robots page.
    const svgs = new Map<string, string>();
    for (const b of builds) {
      try {
        svgs.set(
          b.slug,
          readFileSync(
            join(process.cwd(), "content/figures", `build-${b.slug}.svg`),
            "utf8",
          ),
        );
      } catch {
        errors.push(
          `builds/${b.slug}.yaml has no card drawing: add content/figures/build-${b.slug}.svg`,
        );
      }
    }
    if (errors.length > 0) {
      throw new Error(
        `The Builds have ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return { builds, pages, svgs };
  })();
  return buildsChecked;
}

/** Every Build, in ID order, with its text in `lang`. */
export async function getBuilds(lang: Lang): Promise<BuildPage[]> {
  const { builds, pages, svgs } = await loadBuilds();
  const base = import.meta.env.BASE_URL;
  return builds.map((build) => {
    const entry = pages.find((p) => p.id === `${lang}/${build.slug}`);
    if (!entry) throw new Error(`${build.id} has no ${lang} page`); // checkBuild rules this out
    return {
      build,
      title: entry.data.title,
      summary: entry.data.summary,
      svg: svgs.get(build.slug) ?? "",
      url: localePath(base, lang, `builds/${build.slug}/`),
      entry,
    };
  });
}

let chainChecked:
  | Promise<{ stages: Stage[]; pages: CollectionEntry<"chainPages">[] }>
  | undefined;

/** The signal chain's stages, in order, and its text in `lang`. */
export async function getChain(lang: Lang) {
  chainChecked ??= (async () => {
    const { nodes } = await load();
    // Collections come back sorted by ID; the chain's order is the file's.
    const order = (
      parse(
        readFileSync(
          join(process.cwd(), "content/signal-chain/stages.yaml"),
          "utf8",
        ),
      ) as { id: string }[]
    ).map((s) => s.id);
    const stages = (await getCollection("chainStages"))
      .map((e) => e.data as Stage)
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    const pages = await getCollection("chainPages");
    const errors = checkChain(
      stages,
      new Set(nodes.map((n) => n.id)),
      languages,
      pages.map((p) => p.id),
    );
    if (errors.length > 0) {
      throw new Error(
        `The signal chain has ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return { stages, pages };
  })();
  const { stages, pages } = await chainChecked;
  const entry = pages.find((p) => p.id === lang);
  if (!entry) throw new Error(`the signal chain has no ${lang} page`); // checkChain rules this out
  return {
    stages,
    entry,
    url: localePath(import.meta.env.BASE_URL, lang, "signal-chain/"),
  };
}

/** Every term linked from the Markdown under content/, by language. */
function linkedTerms(): Map<string, Set<string>> {
  const linked = new Map<string, Set<string>>();
  const root = join(process.cwd(), "content");
  for (const file of readdirSync(root, { recursive: true })) {
    const path = String(file);
    // The language is a folder (nodes/en/…) or the file's name (signal-chain/en.md).
    const lang = /(?:^|[/\\])(en|mn)(?:[/\\]|\.md$)/.exec(path)?.[1];
    if (!lang || !path.endsWith(".md")) continue;
    const set = linked.get(lang) ?? new Set<string>();
    for (const id of termLinks(readFileSync(join(root, path), "utf8")))
      set.add(id);
    linked.set(lang, set);
  }
  return linked;
}

let glossaryChecked: Promise<Term[]> | undefined;

/** The glossary, grouped by tier (T0 first) and sorted in `lang`. */
export async function getGlossary(
  lang: Lang,
): Promise<{ groups: TierGroup[]; terms: Map<string, Term>; url: string }> {
  glossaryChecked ??= (async () => {
    const { nodes } = await load();
    const terms = (await getCollection("glossary")).map((e) => e.data as Term);
    const errors = checkGlossary(
      terms,
      new Set(nodes.map((n) => n.id)),
      languages,
      linkedTerms(),
    );
    if (errors.length > 0) {
      throw new Error(
        `The glossary has ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return terms;
  })();
  const terms = await glossaryChecked;
  const { nodes } = await load();
  return {
    groups: groupByTier(terms, new Map(nodes.map((n) => [n.id, n.tier])), lang),
    terms: new Map(terms.map((t) => [t.id, t])),
    url: localePath(import.meta.env.BASE_URL, lang, "glossary/"),
  };
}
