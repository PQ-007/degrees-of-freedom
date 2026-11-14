// Loads the tech tree and its pages from the content collections, checks them
// (src/lib/tree.ts) and fails the build with every problem listed.
import { getCollection, type CollectionEntry } from "astro:content";
import { languages, localePath, type Lang } from "./i18n";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkCompare, type CompareTable } from "./compare";
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

export interface ComparePage {
  table: CompareTable;
  title: string;
  summary: string;
  url: string;
  entry: CollectionEntry<"comparePages">;
}

let comparesChecked:
  | Promise<{
      tables: CompareTable[];
      pages: CollectionEntry<"comparePages">[];
    }>
  | undefined;

function loadCompares() {
  comparesChecked ??= (async () => {
    const { nodes } = await load();
    const tables = (await getCollection("compareTables"))
      .map((e) => e.data as CompareTable)
      .sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
    const pages = await getCollection("comparePages");
    const nodeIds = new Set(nodes.map((n) => n.id));
    const errors = tables.flatMap((table) =>
      checkCompare(
        table,
        nodeIds,
        languages,
        pages
          .filter((p) => p.id.endsWith(`/${table.slug}`))
          .map((p) => p.id.split("/")[0] ?? ""),
      ),
    );
    if (errors.length > 0) {
      throw new Error(
        `The compare pages have ${errors.length} problem(s):\n- ${errors.join("\n- ")}`,
      );
    }
    return { tables, pages };
  })();
  return comparesChecked;
}

/** Every compare page, in ID order, with its text in `lang`. */
export async function getCompares(lang: Lang): Promise<ComparePage[]> {
  const { tables, pages } = await loadCompares();
  const base = import.meta.env.BASE_URL;
  return tables.map((table) => {
    const entry = pages.find((p) => p.id === `${lang}/${table.slug}`);
    if (!entry) throw new Error(`${table.id} has no ${lang} page`); // checkCompare already rules this out
    return {
      table,
      title: entry.data.title,
      summary: entry.data.summary,
      url: localePath(base, lang, `compare/${table.slug}/`),
      entry,
    };
  });
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
