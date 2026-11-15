import { readFileSync } from "node:fs";
import {
  Box3,
  LineBasicMaterial,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
  type Mesh,
  type Object3D,
} from "three";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import type { Materials } from "../../src/three/kit";
import { PART_MODEL_KEYS } from "../../src/three/part-keys";
import { PART_MODELS } from "../../src/three/parts";

const materials = (): Materials => ({
  body: new MeshLambertMaterial(),
  dark: new MeshLambertMaterial(),
  accent: new MeshLambertMaterial(),
  pale: new MeshLambertMaterial(),
  edges: new LineBasicMaterial(),
});

/** Where every accent (moving) mesh is, as a list of world positions. */
function accentPlaces(root: Object3D): number[] {
  root.updateMatrixWorld(true);
  const out: number[] = [];
  root.traverse((o) => {
    if ((o as Mesh).isMesh && o.userData["role"] === "accent") {
      const p = new Vector3().setFromMatrixPosition(o.matrixWorld);
      const q = o.getWorldQuaternion(new Quaternion());
      const s = o.getWorldScale(new Vector3());
      out.push(p.x, p.y, p.z, q.x, q.y, q.z, q.w, s.x, s.y, s.z);
    }
  });
  return out;
}

describe("the parts' 3D models", () => {
  it("the key list matches the models, and every Hardware type has one", () => {
    expect([...PART_MODEL_KEYS].sort()).toEqual(
      Object.keys(PART_MODELS).sort(),
    );
    for (const category of ["motors", "computers", "sensors"]) {
      const data = parse(
        readFileSync(
          new URL(`../../content/hardware/${category}.yaml`, import.meta.url),
          "utf8",
        ),
      ) as { types: { key: string }[] };
      for (const { key } of data.types)
        expect(PART_MODEL_KEYS.has(key), key).toBe(true);
    }
  });

  for (const [key, recipe] of Object.entries(PART_MODELS)) {
    it(`${key}: fits a 3-unit box, has a coloured moving part, and moves`, () => {
      const model = recipe(materials());
      model.pose(0);
      const size = new Box3().setFromObject(model.root).getSize(new Vector3());
      // Big enough to see (boards may be thin), small enough to frame.
      expect(Math.max(size.x, size.y, size.z)).toBeGreaterThan(1);
      for (const d of [size.x, size.y, size.z]) expect(d).toBeLessThan(3.2);
      const before = accentPlaces(model.root);
      expect(before.length).toBeGreaterThan(0);
      // Somewhere in its cycle the moving part is somewhere else.
      const moved = [0.3, 0.7, 1.1, 1.6].some((t) => {
        model.pose(t);
        const now = accentPlaces(model.root);
        return now.some((v, i) => Math.abs(v - (before[i] ?? 0)) > 1e-3);
      });
      expect(moved).toBe(true);
    });
  }
});
