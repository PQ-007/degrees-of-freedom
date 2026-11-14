import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { checkChain, type Stage } from "../../src/lib/chain";
import { languages } from "../../src/lib/i18n";

const root = new URL("../../content/", import.meta.url);
const nodeIds = new Set(
  (
    parse(readFileSync(new URL("tree/nodes.yaml", root), "utf8")) as {
      id: string;
    }[]
  ).map((n) => n.id),
);
const t = { en: "x", mn: "х" };
const stage = (id: string, role: Stage["role"], node = "C9"): Stage => ({
  id,
  role,
  node,
  name: t,
  in: t,
  out: t,
  text: t,
});

describe("checkChain", () => {
  it("accepts Sense, then Think, then Act", () => {
    expect(
      checkChain(
        [stage("a", "sense"), stage("b", "think"), stage("c", "act")],
        nodeIds,
        languages,
        languages,
      ),
    ).toEqual([]);
  });

  it("rejects a stage out of role order, unknown nodes, missing text and a missing role", () => {
    const bad = stage("c", "sense", "Z1");
    bad.text = { en: "x" };
    expect(
      checkChain(
        [stage("a", "sense"), stage("b", "think"), bad],
        nodeIds,
        languages,
        ["en"],
      ),
    ).toEqual([
      "signal chain has no mn text: add content/signal-chain/mn.md",
      "signal-chain/stages.yaml: stage 3 (c) is sense after a later role; keep Sense, then Think, then Act",
      "signal-chain/stages.yaml: stage 3 (c) links node Z1, which is not in nodes.yaml",
      'signal-chain/stages.yaml: stage 3 (c) has no mn "text"',
      "signal-chain/stages.yaml has no act stage",
    ]);
  });
});

describe("the real chain", () => {
  it("passes every check, in the file's order", () => {
    const stages = parse(
      readFileSync(new URL("signal-chain/stages.yaml", root), "utf8"),
    ) as Stage[];
    const pageLangs = readdirSync(new URL("signal-chain/", root))
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
    expect(checkChain(stages, nodeIds, languages, pageLangs)).toEqual([]);
    expect(stages).toHaveLength(14);
  });
});
