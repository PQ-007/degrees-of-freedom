import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { checkBuild, type Build } from "../../src/lib/builds";
import { languages } from "../../src/lib/i18n";

const root = new URL("../../content/", import.meta.url);
const read = <T>(path: string) =>
  parse(readFileSync(new URL(path, root), "utf8")) as T;
const idsIn = (dir: string) =>
  new Set(
    readdirSync(new URL(`${dir}/`, root))
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => read<{ id: string }>(`${dir}/${f}`).id),
  );
const ids = {
  nodes: new Set(read<{ id: string }[]>("tree/nodes.yaml").map((n) => n.id)),
  compares: idsIn("compare"),
  robots: idsIn("robots"),
};
const t = { en: "x", mn: "х" };
const build = (): Build => ({
  id: "B99",
  slug: "demo",
  difficulty: 2,
  time: t,
  nodes: ["C4"],
  parts: [{ node: "C4", compare: "X1", name: t }],
  diagram: { sense: [t], think: [t], act: [t], power: [t] },
  stages: [{ key: "a", title: t, steps: [{ node: "L1", text: t }] }],
});
const check = (b: Build, pageLangs: readonly string[] = languages) =>
  checkBuild(b, ids, languages, pageLangs);

describe("checkBuild", () => {
  it("accepts a complete Build", () => {
    expect(check(build())).toEqual([]);
  });

  it("names every problem", () => {
    const b = build();
    b.difficulty = 7;
    b.robot = "R99";
    b.parts = [{ node: "Z1", compare: "X99", name: { en: "x" } }];
    b.diagram.think = [];
    b.stages[0]?.steps.push({ node: "Q1", text: { en: "y" } });
    expect(check(b, ["en"])).toEqual([
      "builds/demo.yaml has no mn text: add content/builds/mn/demo.md",
      "builds/demo.yaml: difficulty must be 1 to 5",
      "builds/demo.yaml links robot R99, which has no teardown",
      "builds/demo.yaml: part 1 links node Z1, which is not in nodes.yaml",
      "builds/demo.yaml: part 1 links compare page X99, which doesn't exist yet",
      "builds/demo.yaml: part 1 has no mn name",
      "builds/demo.yaml: the diagram's think column is empty",
      "builds/demo.yaml: step 2 links node Q1, which is not in nodes.yaml",
      "builds/demo.yaml: step 2 has no mn text",
    ]);
  });
});

describe("the real Builds", () => {
  for (const f of readdirSync(new URL("builds/", root)).filter((f) =>
    f.endsWith(".yaml"),
  )) {
    it(`${f} passes every check`, () => {
      const b = read<Build>(`builds/${f}`);
      const pageLangs = languages.filter((l) =>
        readdirSync(new URL(`builds/${l}/`, root)).includes(`${b.slug}.md`),
      );
      expect(checkBuild(b, ids, languages, pageLangs)).toEqual([]);
    });
  }
});
