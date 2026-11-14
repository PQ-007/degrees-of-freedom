// The tech tree as data: pure functions, no Astro, no DOM (tested in tests/unit/tree.test.ts).
//
// The structure (ID, tier, slug, needs) is language-independent and lives in
// content/tree/nodes.yaml. Each language has one Markdown file per node, named
// <ID>-<slug>.md, holding its title, summary and text.

export interface TreeNode {
  id: string;
  tier: number;
  slug: string;
  needs: string[];
}

export interface NodePage {
  lang: string;
  /** File name without extension, e.g. "M5-classical-control". */
  file: string;
}

/** Each tier's ID letter: F0…F9 are tier 0, C1…C12 tier 1, and so on. */
export const tierLetters = ["F", "C", "L", "M", "P", "I", "S"] as const;

/** Sort key for IDs: by tier, then by number (M2 before M10). */
export function compareIds(a: string, b: string): number {
  const ta = tierLetters.indexOf(a[0] as (typeof tierLetters)[number]);
  const tb = tierLetters.indexOf(b[0] as (typeof tierLetters)[number]);
  return ta - tb || Number(a.slice(1)) - Number(b.slice(1));
}

/** For each node, the nodes that list it in their needs. */
export function usedBy(nodes: TreeNode[]): Map<string, string[]> {
  const out = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  for (const n of nodes) {
    for (const need of n.needs) out.get(need)?.push(n.id);
  }
  for (const list of out.values()) list.sort(compareIds);
  return out;
}

/** Everything a node needs, directly or through its needs. */
export function allNeeds(nodes: TreeNode[], id: string): Set<string> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const stack = [...(byId.get(id)?.needs ?? [])];
  while (stack.length > 0) {
    const next = stack.pop() as string;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...(byId.get(next)?.needs ?? []));
  }
  return seen;
}

/** A cycle in the needs graph as a path (["A", "B", "A"]), or null. */
export function findCycle(nodes: TreeNode[]): string[] | null {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const state = new Map<string, "open" | "done">();
  const path: string[] = [];
  const visit = (id: string): string[] | null => {
    if (state.get(id) === "done") return null;
    if (state.get(id) === "open") return [...path.slice(path.indexOf(id)), id];
    state.set(id, "open");
    path.push(id);
    for (const need of byId.get(id)?.needs ?? []) {
      if (!byId.has(need)) continue;
      const cycle = visit(need);
      if (cycle) return cycle;
    }
    path.pop();
    state.set(id, "done");
    return null;
  };
  for (const n of nodes) {
    const cycle = visit(n.id);
    if (cycle) return cycle;
  }
  return null;
}

/**
 * Every problem with the tree and its pages, as messages that name the node and
 * the fix. An empty list means the tree is sound.
 */
export function checkTree(
  nodes: TreeNode[],
  pages: NodePage[],
  languages: readonly string[],
): string[] {
  const errors: string[] = [];
  const byId = new Map<string, TreeNode>();
  const slugs = new Map<string, string>();

  for (const n of nodes) {
    if (byId.has(n.id)) errors.push(`${n.id} is listed twice in nodes.yaml`);
    byId.set(n.id, n);
    const owner = slugs.get(n.slug);
    if (owner) errors.push(`${n.id} and ${owner} share the slug "${n.slug}"`);
    slugs.set(n.slug, n.id);
    const letter = tierLetters[n.tier];
    if (!letter || !new RegExp(`^${letter}\\d+$`).test(n.id)) {
      errors.push(
        `${n.id} is in tier ${n.tier}, whose IDs start with "${letter ?? "?"}"`,
      );
    }
  }

  for (const n of nodes) {
    const seen = new Set<string>();
    for (const need of n.needs) {
      if (seen.has(need)) errors.push(`${n.id} lists ${need} twice`);
      seen.add(need);
      const target = byId.get(need);
      if (need === n.id) errors.push(`${n.id} needs itself`);
      else if (!target)
        errors.push(`${n.id} needs ${need}, which is not in nodes.yaml`);
      else if (target.tier > n.tier) {
        errors.push(
          `${n.id} (tier ${n.tier}) needs ${need} from a higher tier (${target.tier})`,
        );
      }
    }
  }

  const cycle = findCycle(nodes);
  if (cycle) errors.push(`the needs form a cycle: ${cycle.join(" → ")}`);

  // Only direct needs: a need that another need already brings in is noise in the graph.
  if (!cycle) {
    for (const n of nodes) {
      for (const need of n.needs) {
        const via = n.needs.find(
          (other) => other !== need && allNeeds(nodes, other).has(need),
        );
        if (via)
          errors.push(
            `${n.id} lists ${need}, but it already comes through ${via}; remove it`,
          );
      }
    }
  }

  const expected = new Set(nodes.map((n) => `${n.id}-${n.slug}`));
  for (const lang of languages) {
    const files = new Set(
      pages.filter((p) => p.lang === lang).map((p) => p.file),
    );
    for (const n of nodes) {
      if (!files.has(`${n.id}-${n.slug}`)) {
        errors.push(
          `${n.id} has no ${lang} page: add content/nodes/${lang}/${n.id}-${n.slug}.md`,
        );
      }
    }
  }
  for (const p of pages) {
    if (!languages.includes(p.lang)) {
      errors.push(
        `content/nodes/${p.lang}/${p.file}.md is in an unknown language "${p.lang}"`,
      );
    } else if (!expected.has(p.file)) {
      errors.push(
        `content/nodes/${p.lang}/${p.file}.md matches no node: name it <ID>-<slug>.md as in nodes.yaml`,
      );
    }
  }

  return errors;
}
