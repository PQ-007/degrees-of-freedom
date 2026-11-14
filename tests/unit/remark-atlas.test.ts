import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  loadRefs,
  transformAtlasRefs,
  type AtlasRefs,
  type MdNode,
} from "../../src/lib/remark-atlas";

const refs: AtlasRefs = {
  nodes: new Map([
    ["C4", { slug: "electric-motors", title: "Electric motors" }],
  ]),
  sources: new Set(["unimate", "capek-robot"]),
  terms: new Map([
    ["encoder", { term: "Encoder", def: "A sensor that measures turning." }],
  ]),
  base: "/dof/",
  lang: "en",
  file: "content/nodes/en/F0-test.md",
};
const para = (value: string): MdNode & { children: MdNode[] } => ({
  type: "root",
  children: [{ type: "paragraph", children: [{ type: "text", value }] }],
});

describe("citations", () => {
  it("number sources by first use and reuse the number", () => {
    const tree = para("A[@unimate] B[@capek-robot] C[@unimate].");
    expect(transformAtlasRefs(tree, refs)).toEqual(["unimate", "capek-robot"]);
    const html = (tree.children[0]?.children ?? [])
      .filter((n) => n.type === "html")
      .map((n) => n.value);
    expect(html).toEqual([
      '<sup class="cite"><a href="#src-unimate" id="ref-unimate-1">1</a></sup>',
      '<sup class="cite"><a href="#src-capek-robot" id="ref-capek-robot-1">2</a></sup>',
      '<sup class="cite"><a href="#src-unimate" id="ref-unimate-2">1</a></sup>',
    ]);
  });

  it("fail the build on an unknown source, naming the file and the fix", () => {
    expect(() => transformAtlasRefs(para("x[@nope]"), refs)).toThrow(
      "content/nodes/en/F0-test.md: [@nope] is not in content/sources.yaml; add it there",
    );
  });
});

describe("node links", () => {
  it("link to the node in the page's language, with its title or given text", () => {
    const tree = para("See [[C4]] and [[C4|motors]].");
    transformAtlasRefs(tree, refs);
    const links = (tree.children[0]?.children ?? []).filter(
      (n) => n.type === "link",
    );
    expect(links?.map((l) => [l.url, l.children?.[0]?.value])).toEqual([
      ["/dof/en/node/electric-motors/", "Electric motors"],
      ["/dof/en/node/electric-motors/", "motors"],
    ]);
  });

  it("fail the build on an unknown node", () => {
    expect(() => transformAtlasRefs(para("[[Z9]]"), refs)).toThrow(
      "content/nodes/en/F0-test.md: [[Z9]] is not a node in content/tree/nodes.yaml",
    );
  });

  it("leave code alone", () => {
    const tree: MdNode & { children: MdNode[] } = {
      type: "root",
      children: [{ type: "inlineCode", value: "[[C4]]" }],
    };
    expect(transformAtlasRefs(tree, refs)).toEqual([]);
    expect(tree.children[0]).toEqual({ type: "inlineCode", value: "[[C4]]" });
  });
});

describe("term links", () => {
  it("link to the glossary entry, with the term or given text and the definition as a title", () => {
    const tree = para("An [[~encoder|encoder]] counts. [[~encoder]].");
    transformAtlasRefs(tree, refs);
    const links = (tree.children[0]?.children ?? []).filter(
      (n) => n.type === "link",
    );
    expect(links.map((l) => [l.url, l.title, l.children?.[0]?.value])).toEqual([
      [
        "/dof/en/glossary/#encoder",
        "A sensor that measures turning.",
        "encoder",
      ],
      [
        "/dof/en/glossary/#encoder",
        "A sensor that measures turning.",
        "Encoder",
      ],
    ]);
  });

  it("fail the build on an unknown term", () => {
    expect(() => transformAtlasRefs(para("[[~nope]]"), refs)).toThrow(
      "content/nodes/en/F0-test.md: [[~nope]] is not a term in content/glossary/terms.yaml",
    );
  });
});

describe("heading anchors", () => {
  it("take a fixed id from {#id} and drop it from the text", () => {
    const tree: MdNode & { children: MdNode[] } = {
      type: "root",
      children: [
        { type: "heading", children: [{ type: "text", value: "Бие {#body}" }] },
      ],
    };
    transformAtlasRefs(tree, refs);
    expect(tree.children[0]).toEqual({
      type: "heading",
      children: [{ type: "text", value: "Бие" }],
      data: { hProperties: { id: "body" } },
    });
  });
});

describe("the real content", () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const sources = parse(
    readFileSync(`${root}content/sources.yaml`, "utf8"),
  ) as {
    id: string;
    checked: string;
    uncertain?: { en?: string; mn?: string };
  }[];

  it("every source has a checked date, and debated ones say why in both languages", () => {
    for (const s of sources) {
      expect(s.checked, s.id).toMatch(/\d{4}-\d{2}-\d{2}/);
      if (s.uncertain) {
        expect(s.uncertain.en?.trim(), `${s.id}: uncertain.en`).toBeTruthy();
        expect(s.uncertain.mn?.trim(), `${s.id}: uncertain.mn`).toBeTruthy();
      }
    }
  });

  it("every citation and node link in every page resolves, and both languages cite the same sources", () => {
    const citedBy: Record<string, Record<string, string[]>> = {};
    for (const dir of ["nodes", "compare", "robots", "roadmaps", "builds"]) {
      for (const lang of ["en", "mn"]) {
        const loaded = loadRefs(root, lang);
        for (const f of readdirSync(`${root}content/${dir}/${lang}`)) {
          const body = readFileSync(
            `${root}content/${dir}/${lang}/${f}`,
            "utf8",
          )
            .split("---")
            .slice(2)
            .join("---");
          const cited = transformAtlasRefs(para(body), {
            ...loaded,
            base: "/",
            lang,
            file: `content/${dir}/${lang}/${f}`,
          });
          (citedBy[`${dir}/${f}`] ??= {})[lang] = [...cited].sort();
        }
      }
    }
    for (const lang of ["en", "mn"]) {
      const body = readFileSync(
        `${root}content/signal-chain/${lang}.md`,
        "utf8",
      )
        .split("---")
        .slice(2)
        .join("---");
      const cited = transformAtlasRefs(para(body), {
        ...loadRefs(root, lang),
        base: "/",
        lang,
        file: `content/signal-chain/${lang}.md`,
      });
      (citedBy["signal-chain"] ??= {})[lang] = [...cited].sort();
    }
    for (const [f, byLang] of Object.entries(citedBy)) {
      expect(byLang["mn"], `${f}: Mongolian cites different sources`).toEqual(
        byLang["en"],
      );
    }
  });
});
