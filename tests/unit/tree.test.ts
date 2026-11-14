import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { languages } from "../../src/lib/i18n";
import {
  checkTree,
  compareIds,
  findCycle,
  usedBy,
  type NodePage,
  type TreeNode,
} from "../../src/lib/tree";

const root = new URL("../../content/", import.meta.url);

describe("the real tree", () => {
  const nodes = parse(
    readFileSync(new URL("tree/nodes.yaml", root), "utf8"),
  ) as TreeNode[];
  const pages: NodePage[] = languages.flatMap((lang) =>
    readdirSync(new URL(`nodes/${lang}/`, root))
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({ lang, file: f.replace(/\.md$/, "") })),
  );

  it("passes every check", () => {
    expect(checkTree(nodes, pages, languages)).toEqual([]);
  });

  it("has all 71 nodes of the content plan, 10 of them foundations", () => {
    expect(nodes).toHaveLength(71);
    expect(nodes.filter((n) => n.tier === 0)).toHaveLength(10);
  });

  it("starts from F0 alone: every other node needs something", () => {
    expect(nodes.filter((n) => n.needs.length === 0).map((n) => n.id)).toEqual([
      "F0",
    ]);
  });

  it("every page has a title and a summary", () => {
    for (const p of pages) {
      const text = readFileSync(
        new URL(`nodes/${p.lang}/${p.file}.md`, root),
        "utf8",
      );
      const front = parse(text.split("---")[1] ?? "") as {
        title?: string;
        summary?: string;
      };
      expect(front.title?.trim(), `${p.lang}/${p.file}: title`).toBeTruthy();
      expect(
        front.summary?.trim(),
        `${p.lang}/${p.file}: summary`,
      ).toBeTruthy();
    }
  });
});

describe("checkTree", () => {
  const node = (id: string, tier: number, needs: string[] = []): TreeNode => ({
    id,
    tier,
    slug: id.toLowerCase(),
    needs,
  });
  const pagesFor = (nodes: TreeNode[]): NodePage[] =>
    languages.flatMap((lang) =>
      nodes.map((n) => ({ lang, file: `${n.id}-${n.slug}` })),
    );
  const check = (nodes: TreeNode[], pages = pagesFor(nodes)) =>
    checkTree(nodes, pages, languages);

  it("accepts a sound tree", () => {
    expect(
      check([node("F0", 0), node("F1", 0, ["F0"]), node("C1", 1, ["F1"])]),
    ).toEqual([]);
  });

  it("names a missing need", () => {
    expect(check([node("F0", 0, ["F9"])])).toContain(
      "F0 needs F9, which is not in nodes.yaml",
    );
  });

  it("rejects a need from a higher tier", () => {
    expect(check([node("F0", 0, ["C1"]), node("C1", 1)])).toContain(
      "F0 (tier 0) needs C1 from a higher tier (1)",
    );
  });

  it("finds a cycle and shows its path", () => {
    const nodes = [
      node("F0", 0, ["F2"]),
      node("F1", 0, ["F0"]),
      node("F2", 0, ["F1"]),
    ];
    expect(findCycle(nodes)).toEqual(["F0", "F2", "F1", "F0"]);
    expect(check(nodes)).toContain("the needs form a cycle: F0 → F2 → F1 → F0");
  });

  it("rejects a need that another need already brings in", () => {
    const nodes = [
      node("F0", 0),
      node("F1", 0, ["F0"]),
      node("C1", 1, ["F0", "F1"]),
    ];
    expect(check(nodes)).toContain(
      "C1 lists F0, but it already comes through F1; remove it",
    );
  });

  it("checks the ID letter against the tier", () => {
    expect(check([node("C1", 0)])).toContain(
      'C1 is in tier 0, whose IDs start with "F"',
    );
  });

  it("rejects duplicate IDs and slugs", () => {
    const a = node("F0", 0);
    const b = { ...node("F1", 0), slug: "f0" };
    expect(check([a, a])).toContain("F0 is listed twice in nodes.yaml");
    expect(check([a, b])).toContain('F1 and F0 share the slug "f0"');
  });

  it("needs a page per node in every language, and no stray pages", () => {
    const nodes = [node("F0", 0)];
    expect(check(nodes, [{ lang: "en", file: "F0-f0" }])).toContain(
      "F0 has no mn page: add content/nodes/mn/F0-f0.md",
    );
    expect(
      check(nodes, [...pagesFor(nodes), { lang: "en", file: "F1-old" }]),
    ).toContain(
      "content/nodes/en/F1-old.md matches no node: name it <ID>-<slug>.md as in nodes.yaml",
    );
  });
});

describe("helpers", () => {
  it("sorts IDs by tier, then number", () => {
    expect(["M10", "C2", "M2", "F9", "S1"].sort(compareIds)).toEqual([
      "F9",
      "C2",
      "M2",
      "M10",
      "S1",
    ]);
  });

  it("lists what uses each node", () => {
    const map = usedBy([
      { id: "F0", tier: 0, slug: "a", needs: [] },
      { id: "F1", tier: 0, slug: "b", needs: ["F0"] },
      { id: "C1", tier: 1, slug: "c", needs: ["F0"] },
    ]);
    expect(map.get("F0")).toEqual(["F1", "C1"]);
    expect(map.get("C1")).toEqual([]);
  });
});
