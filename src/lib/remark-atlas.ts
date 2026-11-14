// A remark plugin for the atlas's own Markdown syntax:
//
//   [@unimate]          a citation: becomes a numbered superscript linking to
//                       the page's Sources list (numbered by first use)
//   [[C4]]              a link to node C4's page, showing its title in the
//   [[C4|motors]]       page's language, or the given text
//
// An unknown source or node fails the build with the file and the fix.
// The cited IDs, in order, go to the page as remarkPluginFrontmatter.citations.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RemarkPlugin } from "@astrojs/markdown-remark";
import { parse } from "yaml";

export interface MdNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdNode[];
  data?: { hProperties?: Record<string, unknown> };
}

export interface AtlasRefs {
  /** Node ID → its slug and its title in this page's language. */
  nodes: Map<string, { slug: string; title: string }>;
  sources: Set<string>;
  /** Site base, e.g. "/degrees-of-freedom/". */
  base: string;
  lang: string;
  /** For error messages. */
  file: string;
}

const PATTERN = /\[@([a-z0-9-]+)\]|\[\[([A-Z]\d+)(?:\|([^\]]+))?\]\]/g;
const SKIP = new Set(["link", "linkReference", "code", "inlineCode", "html"]);

/** Rewrites citations and node links in place; returns the cited IDs in order. */
export function transformAtlasRefs(tree: MdNode, refs: AtlasRefs): string[] {
  const cited: string[] = [];
  const uses = new Map<string, number>();

  const replace = (text: string): MdNode[] => {
    const out: MdNode[] = [];
    let last = 0;
    for (const m of text.matchAll(PATTERN)) {
      const at = m.index;
      if (at > last) out.push({ type: "text", value: text.slice(last, at) });
      last = at + m[0].length;
      const [, sourceId, nodeId, label] = m;
      if (sourceId) {
        if (!refs.sources.has(sourceId)) {
          throw new Error(
            `${refs.file}: [@${sourceId}] is not in content/sources.yaml; add it there`,
          );
        }
        if (!cited.includes(sourceId)) cited.push(sourceId);
        const n = cited.indexOf(sourceId) + 1;
        const k = (uses.get(sourceId) ?? 0) + 1;
        uses.set(sourceId, k);
        out.push({
          type: "html",
          value: `<sup class="cite"><a href="#src-${sourceId}" id="ref-${sourceId}-${k}">${n}</a></sup>`,
        });
      } else if (nodeId) {
        const node = refs.nodes.get(nodeId);
        if (!node)
          throw new Error(
            `${refs.file}: [[${nodeId}]] is not a node in content/tree/nodes.yaml`,
          );
        out.push({
          type: "link",
          url: `${refs.base}${refs.lang}/node/${node.slug}/`,
          children: [{ type: "text", value: label ?? node.title }],
          data: { hProperties: { className: ["node-ref"] } },
        });
      }
    }
    if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    return out;
  };

  const walk = (node: MdNode) => {
    if (!node.children || SKIP.has(node.type)) return;
    const next: MdNode[] = [];
    for (const child of node.children) {
      if (child.type === "text" && child.value && PATTERN.test(child.value)) {
        PATTERN.lastIndex = 0;
        next.push(...replace(child.value));
      } else {
        PATTERN.lastIndex = 0;
        walk(child);
        next.push(child);
      }
    }
    node.children = next;
  };
  walk(tree);
  return cited;
}

/** Reads the tree, the node titles of `lang` and the source IDs from content/. */
export function loadRefs(
  root: string,
  lang: string,
): Omit<AtlasRefs, "base" | "lang" | "file"> {
  const tree = parse(
    readFileSync(join(root, "content/tree/nodes.yaml"), "utf8"),
  ) as {
    id: string;
    slug: string;
  }[];
  const titles = new Map<string, string>();
  const dir = join(root, "content/nodes", lang);
  for (const f of readdirSync(dir)) {
    const front = readFileSync(join(dir, f), "utf8").split("---")[1] ?? "";
    const title = (parse(front) as { title?: string } | null)?.title;
    const id = f.split("-")[0];
    if (id && title) titles.set(id, title);
  }
  const sources = parse(
    readFileSync(join(root, "content/sources.yaml"), "utf8"),
  ) as { id: string }[];
  return {
    nodes: new Map(
      tree.map((n) => [
        n.id,
        { slug: n.slug, title: titles.get(n.id) ?? n.id },
      ]),
    ),
    sources: new Set(sources.map((s) => s.id)),
  };
}

interface VFileLike {
  path?: string;
  data: { astro?: { frontmatter?: Record<string, unknown> } };
}

export const remarkAtlas: RemarkPlugin<[{ base: string; root: string }]> = (
  options,
) => {
  return (tree, vfile) => {
    const file = vfile as unknown as VFileLike;
    const path = file.path ?? "";
    const lang = /[/\\](en|mn)[/\\]/.exec(path)?.[1];
    if (!lang) return;
    const cited = transformAtlasRefs(tree as unknown as MdNode, {
      ...loadRefs(options.root, lang),
      base: options.base,
      lang,
      file: path.slice(path.indexOf("content")),
    });
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter["citations"] = cited;
  };
};
