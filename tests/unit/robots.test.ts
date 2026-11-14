import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { languages } from "../../src/lib/i18n";
import {
  checkRobot,
  figureCallouts,
  sectionAnchors,
  TEMPLATE,
  type RobotData,
  type RobotText,
} from "../../src/lib/robots";

const root = new URL("../../content/", import.meta.url);
const nodeIds = new Set(
  (
    parse(readFileSync(new URL("tree/nodes.yaml", root), "utf8")) as {
      id: string;
    }[]
  ).map((n) => n.id),
);
const fullBody = TEMPLATE.map((a) => `## Title {#${a}}\n\ntext\n`).join("\n");
const robot = (): RobotData => ({
  id: "R9",
  slug: "demo",
  figure: "demo.svg",
  nodes: ["C3"],
  callouts: [
    {
      n: 1,
      role: "act",
      node: "C3",
      section: "body",
      label: { en: "Wheels", mn: "Дугуй" },
    },
  ],
});
const texts = (body = fullBody): RobotText[] =>
  languages.map((lang) => ({
    lang,
    body,
    glance: [{ label: "a", value: "b" }],
  }));
const svg = '<svg><g data-callout="1"></g></svg>';

describe("checkRobot", () => {
  it("accepts a complete teardown", () => {
    expect(checkRobot(robot(), svg, texts(), nodeIds, languages)).toEqual([]);
  });

  it("insists on the 12 template sections, in order, in every language", () => {
    const swapped = fullBody
      .replace("{#job}", "{#TMP}")
      .replace("{#body}", "{#job}")
      .replace("{#TMP}", "{#body}");
    const errors = checkRobot(robot(), svg, texts(swapped), nodeIds, languages);
    expect(errors).toHaveLength(languages.length);
    expect(errors[0]).toContain(
      "robots/en/demo.md must have the 12 template sections in order",
    );
    expect(errors[0]).toContain("found body, job, actuators");
  });

  it("matches the callouts in the YAML with the numbers in the drawing", () => {
    expect(
      checkRobot(robot(), "<svg></svg>", texts(), nodeIds, languages),
    ).toEqual([
      "robots/demo.yaml: the drawing has callouts [] but the YAML lists [1]",
    ]);
    expect(checkRobot(robot(), null, texts(), nodeIds, languages)).toEqual([
      "robots/demo.yaml: the drawing content/robots/demo.svg is missing",
    ]);
  });

  it("names bad callouts", () => {
    const r = robot();
    r.callouts = [
      { n: 2, role: "act", node: "Z1", section: "legs", label: { en: "x" } },
    ];
    expect(
      checkRobot(r, '<g data-callout="2">', texts(), nodeIds, languages),
    ).toEqual([
      "robots/demo.yaml: callouts must be numbered 1, 2, 3… in order; found 2 at place 1",
      "robots/demo.yaml: callout 2 links node Z1, which is not in nodes.yaml",
      'robots/demo.yaml: callout 2 points to section "legs", which is not a template section',
      "robots/demo.yaml: callout 2 has no mn label",
    ]);
  });

  it("reads anchors and callout numbers", () => {
    expect(
      sectionAnchors("## A {#job}\ntext\n## B {#body}\n### C {#x}"),
    ).toEqual(["job", "body"]);
    expect(
      figureCallouts('<g data-callout="1"/><g data-callout="2"/>'),
    ).toEqual([1, 2]);
  });
});

describe("the real teardowns", () => {
  for (const f of readdirSync(root.pathname + "robots").filter((f) =>
    f.endsWith(".yaml"),
  )) {
    it(`${f} passes every check`, () => {
      const r = parse(
        readFileSync(new URL(`robots/${f}`, root), "utf8"),
      ) as RobotData;
      const svgText = readFileSync(new URL(`robots/${r.figure}`, root), "utf8");
      const real = languages.map((lang) => {
        const text = readFileSync(
          new URL(`robots/${lang}/${r.slug}.md`, root),
          "utf8",
        );
        const [, front = "", ...rest] = text.split("---");
        return {
          lang,
          body: rest.join("---"),
          glance: (parse(front) as { glance: RobotText["glance"] }).glance,
        };
      });
      expect(checkRobot(r, svgText, real, nodeIds, languages)).toEqual([]);
    });
  }
});
