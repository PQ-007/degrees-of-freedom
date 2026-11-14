import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { languages } from "../../src/lib/i18n";
import { checkRoadmap, pathNodes, type Roadmap } from "../../src/lib/roadmaps";

const root = new URL("../../content/", import.meta.url);
const tree = parse(readFileSync(new URL("tree/nodes.yaml", root), "utf8")) as {
  id: string;
  needs: string[];
}[];
const needsOf = new Map(tree.map((n) => [n.id, n.needs]));
const robots = new Set(
  readdirSync(new URL("robots/", root))
    .filter((f) => f.endsWith(".yaml"))
    .map(
      (f) =>
        (
          parse(readFileSync(new URL(`robots/${f}`, root), "utf8")) as {
            id: string;
          }
        ).id,
    ),
);
const why = { en: "x", mn: "х" };
const roadmap = (steps: string[]): Roadmap => ({
  slug: "demo",
  stages: [
    {
      key: "a",
      title: { en: "A", mn: "А" },
      steps: steps.map((node) => ({ node, level: "must", why })),
    },
  ],
  later: [],
});
const check = (r: Roadmap) =>
  checkRoadmap(r, needsOf, robots, languages, languages);

describe("checkRoadmap", () => {
  it("accepts a path in prerequisite order", () => {
    expect(check(roadmap(["F0", "F1", "F2"]))).toEqual([]);
  });

  it("rejects a topic placed before something it needs", () => {
    expect(check(roadmap(["F1", "F0"]))).toEqual([
      "roadmaps/demo.yaml: F1 needs F0, so F0 must come before it on the path",
    ]);
  });

  it("rejects duplicates, unknown nodes and robots, and missing text", () => {
    const r = roadmap(["F0", "F0", "Z1"]);
    r.robot = "R99";
    r.later = [{ node: "F1", why: { en: "x" } }];
    expect(checkRoadmap(r, needsOf, robots, languages, ["en"])).toEqual([
      "roadmaps/demo.yaml has no mn text: add content/roadmaps/mn/demo.md",
      "roadmaps/demo.yaml links robot R99, which has no teardown",
      "roadmaps/demo.yaml: F0 is on the path twice",
      "roadmaps/demo.yaml: Z1 is not a node in nodes.yaml",
      'roadmaps/demo.yaml: F1 has no mn "why"',
    ]);
  });

  it("lists the path with later topics last", () => {
    const r = roadmap(["F0"]);
    r.later = [{ node: "F1", why }];
    expect(pathNodes(r)).toEqual(["F0", "F1"]);
  });
});

describe("the real roadmaps", () => {
  for (const f of readdirSync(new URL("roadmaps/", root)).filter((f) =>
    f.endsWith(".yaml"),
  )) {
    it(`${f} passes every check`, () => {
      const r = parse(
        readFileSync(new URL(`roadmaps/${f}`, root), "utf8"),
      ) as Roadmap;
      const pageLangs = languages.filter((l) =>
        readdirSync(new URL(`roadmaps/${l}/`, root)).includes(`${r.slug}.md`),
      );
      expect(checkRoadmap(r, needsOf, robots, languages, pageLangs)).toEqual(
        [],
      );
    });
  }
});
