import { readFileSync } from "node:fs";
import { Box3, LineBasicMaterial, MeshLambertMaterial, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { Materials } from "../../src/three/kit";
import { ROBOT_MODEL_KEYS } from "../../src/three/robot-keys";
import { ROBOT_MODELS } from "../../src/three/robots/planetary-rover";

const materials = (): Materials => ({
  body: new MeshLambertMaterial(),
  dark: new MeshLambertMaterial(),
  accent: new MeshLambertMaterial(),
  pale: new MeshLambertMaterial(),
  edges: new LineBasicMaterial(),
});

describe("the robots' 3D models", () => {
  it("the key list matches the models", () => {
    expect([...ROBOT_MODEL_KEYS].sort()).toEqual(
      Object.keys(ROBOT_MODELS).sort(),
    );
  });

  for (const [slug, recipe] of Object.entries(ROBOT_MODELS)) {
    it(`${slug}: one numbered part per callout of the teardown, labels near their parts`, () => {
      const robot = parse(
        readFileSync(
          new URL(`../../content/robots/${slug}.yaml`, import.meta.url),
          "utf8",
        ),
      ) as { callouts: { n: number }[] };
      const model = recipe(materials());
      model.pose(0);
      const callouts = model.callouts ?? [];
      expect(callouts.map((c) => c.n)).toEqual(robot.callouts.map((c) => c.n));
      model.root.updateMatrixWorld(true);
      const whole = new Box3().setFromObject(model.root);
      const size = whole.getSize(new Vector3()).length();
      for (const c of callouts) {
        expect(c.parts.length, `callout ${c.n}`).toBeGreaterThan(0);
        // The label sits within reach of the part it names.
        const box = new Box3();
        for (const p of c.parts) box.expandByObject(p);
        const d = box.distanceToPoint(new Vector3(...c.anchor));
        expect(d, `callout ${c.n}`).toBeLessThan(size * 0.25);
      }
    });

    it(`${slug}: something moves`, () => {
      const model = recipe(materials());
      model.pose(0);
      model.root.updateMatrixWorld(true);
      const snapshot = () => {
        const out: number[] = [];
        model.root.traverse((o) => out.push(...o.matrixWorld.elements));
        return out;
      };
      const before = snapshot();
      model.pose(1.3);
      model.root.updateMatrixWorld(true);
      const after = snapshot();
      expect(after.some((v, i) => Math.abs(v - (before[i] ?? 0)) > 1e-3)).toBe(
        true,
      );
    });
  }
});
