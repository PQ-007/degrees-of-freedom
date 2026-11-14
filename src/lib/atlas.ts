// Loads the tech tree and its pages from the content collections, checks them
// (src/lib/tree.ts) and fails the build with every problem listed.
import { getCollection, type CollectionEntry } from "astro:content";
import { languages, localePath, type Lang } from "./i18n";
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
