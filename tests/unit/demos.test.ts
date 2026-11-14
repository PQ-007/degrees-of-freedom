// Demos in the content: every custom element the Markdown uses is a registered
// demo, and every MuJoCo model loads in the real engine.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import load from "@mujoco/mujoco";
import { describe, expect, it } from "vitest";
import { DEMOS } from "../../src/demos/registry";
import { SimRunner } from "../../src/sim/runner";

const content = fileURLToPath(new URL("../../content/", import.meta.url));

describe("demos in the Markdown", () => {
  it("every custom element is registered in src/demos/registry.ts", () => {
    const used = new Set<string>();
    for (const file of readdirSync(content, { recursive: true })) {
      const path = String(file);
      if (!path.endsWith(".md")) continue;
      const text = readFileSync(join(content, path), "utf8");
      for (const m of text.matchAll(/<([a-z][a-z0-9]*-[a-z0-9-]+)[\s>]/g))
        used.add(m[1] ?? "");
    }
    expect(used.size).toBeGreaterThan(0);
    for (const tag of used)
      expect(Object.keys(DEMOS), `<${tag}> is not registered`).toContain(tag);
  });
});

describe("MuJoCo models", () => {
  for (const f of readdirSync(join(content, "models")).filter((f) =>
    f.endsWith(".xml"),
  )) {
    it(`${f} loads and steps`, async () => {
      const mj = await load();
      const sim = new SimRunner(
        mj,
        readFileSync(join(content, "models", f), "utf8"),
      );
      sim.advance(0.1);
      expect(sim.data.time).toBeCloseTo(0.1, 5);
      sim.dispose();
    });
  }
});
