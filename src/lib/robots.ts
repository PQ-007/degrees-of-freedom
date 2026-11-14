// Robot teardowns as data: pure functions, no Astro, no DOM (tests/unit/robots.test.ts).
//
// content/robots/<slug>.yaml holds the language-independent parts (ID, the
// drawing, numbered callouts); content/robots/<lang>/<slug>.md holds the text,
// which must have the template's 12 sections, in order, with these anchors, so
// every robot can be compared section by section (CONTENT_PLAN.md §5).

export const TEMPLATE = [
  "job",
  "body",
  "actuators",
  "power",
  "sensors",
  "compute",
  "communication",
  "software",
  "control",
  "hard-problems",
  "examples",
  "start",
] as const;

export const ROLES = ["sense", "think", "act", "none"] as const;
export type Role = (typeof ROLES)[number];

export interface Callout {
  n: number;
  role: Role;
  node: string;
  section: string;
  label: Record<string, string>;
}

export interface RobotData {
  id: string;
  slug: string;
  figure: string;
  nodes: string[];
  callouts: Callout[];
}

export interface RobotText {
  lang: string;
  body: string;
  glance: { label: string; value: string }[];
}

/** The anchors of the "## Heading {#anchor}" lines in a Markdown body, in order. */
export function sectionAnchors(body: string): string[] {
  return [...body.matchAll(/^##\s+.*\{#([a-z0-9-]+)\}\s*$/gm)].map(
    (m) => m[1] ?? "",
  );
}

/** The callout numbers drawn in an SVG (data-callout="n"), in order. */
export function figureCallouts(svg: string): number[] {
  return [...svg.matchAll(/data-callout="(\d+)"/g)].map((m) => Number(m[1]));
}

/** Every problem with a teardown, as messages naming the file and the fix. */
export function checkRobot(
  robot: RobotData,
  svg: string | null,
  texts: RobotText[],
  nodeIds: ReadonlySet<string>,
  languages: readonly string[],
): string[] {
  const errors: string[] = [];
  const at = `robots/${robot.slug}.yaml`;

  for (const id of robot.nodes) {
    if (!nodeIds.has(id))
      errors.push(`${at} links node ${id}, which is not in nodes.yaml`);
  }

  robot.callouts.forEach((c, i) => {
    const where = `${at}: callout ${c.n}`;
    if (c.n !== i + 1)
      errors.push(
        `${at}: callouts must be numbered 1, 2, 3… in order; found ${c.n} at place ${i + 1}`,
      );
    if (!ROLES.includes(c.role))
      errors.push(`${where} has role "${c.role}"; use ${ROLES.join(", ")}`);
    if (!nodeIds.has(c.node))
      errors.push(`${where} links node ${c.node}, which is not in nodes.yaml`);
    if (!(TEMPLATE as readonly string[]).includes(c.section)) {
      errors.push(
        `${where} points to section "${c.section}", which is not a template section`,
      );
    }
    for (const l of languages) {
      if (!c.label[l]?.trim()) errors.push(`${where} has no ${l} label`);
    }
  });

  if (svg === null) {
    errors.push(`${at}: the drawing content/robots/${robot.figure} is missing`);
  } else {
    const drawn = figureCallouts(svg).join(",");
    const listed = robot.callouts.map((c) => c.n).join(",");
    if (drawn !== listed) {
      errors.push(
        `${at}: the drawing has callouts [${drawn}] but the YAML lists [${listed}]`,
      );
    }
  }

  const glanceSizes = new Set<number>();
  for (const lang of languages) {
    const text = texts.find((t) => t.lang === lang);
    if (!text) {
      errors.push(
        `${at} has no ${lang} text: add content/robots/${lang}/${robot.slug}.md`,
      );
      continue;
    }
    const found = sectionAnchors(text.body);
    if (found.join(",") !== TEMPLATE.join(",")) {
      errors.push(
        `robots/${lang}/${robot.slug}.md must have the 12 template sections in order, ` +
          `"## Title {#anchor}" with anchors ${TEMPLATE.join(", ")}; found ${found.join(", ") || "none"}`,
      );
    }
    glanceSizes.add(text.glance.length);
  }
  if (glanceSizes.size > 1)
    errors.push(
      `${at}: "At a glance" has a different number of rows in different languages`,
    );

  return errors;
}
