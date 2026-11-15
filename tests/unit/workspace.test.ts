import { describe, expect, it } from "vitest";
import {
  arcsAt,
  area,
  coverAt,
  distance,
  forward,
  reach,
  type Arm,
} from "../../src/demos/models/workspace";

const free: Arm = { l1: 0.3, l2: 0.2, shoulder: Math.PI, elbow: Math.PI };
const deg = (d: number) => (d * Math.PI) / 180;

describe("a two-joint arm", () => {
  it("puts its tip where the two links point", () => {
    const { elbow, tip } = forward(free, Math.PI / 2, -Math.PI / 2);
    expect(elbow.x).toBeCloseTo(0, 12);
    expect(elbow.y).toBeCloseTo(0.3, 12);
    expect(tip.x).toBeCloseTo(0.2, 12);
    expect(tip.y).toBeCloseTo(0.3, 12);
    expect(Math.hypot(tip.x, tip.y)).toBeCloseTo(distance(free, -Math.PI / 2));
  });

  it("with free joints reaches a ring from |l1 − l2| to l1 + l2, of area 4π·l1·l2", () => {
    expect(reach(free).min).toBeCloseTo(0.1, 12);
    expect(reach(free).max).toBeCloseTo(0.5, 12);
    expect(area(free)).toBeCloseTo(4 * Math.PI * 0.3 * 0.2, 4);
    expect(area({ ...free, l1: 0.25, l2: 0.25 })).toBeGreaterThan(area(free));
  });

  it("a limited elbow leaves a bigger hole round the shoulder", () => {
    const stiff = { ...free, elbow: deg(90) };
    expect(reach(stiff).min).toBeCloseTo(Math.hypot(0.3, 0.2), 12);
    expect(arcsAt(stiff, 0.2)).toEqual([]);
    expect(coverAt(stiff, 0.45)).toBeCloseTo(2 * Math.PI, 12);
  });

  it("a limited shoulder sweeps a fan, and the cover matches its arcs", () => {
    const fan = { ...free, shoulder: deg(30) };
    // Straight out (elbow at 0): just the shoulder's swing, 60°.
    expect(coverAt(fan, 0.5 - 1e-9)).toBeCloseTo(deg(60), 3);
    // Bent far (the tip 41° off link 1): two arcs, a gap ahead and behind.
    const r = distance(fan, deg(120));
    const arcs = arcsAt(fan, r);
    expect(arcs).toHaveLength(2);
    expect(coverAt(fan, r)).toBeCloseTo(deg(120), 9);
    expect(area(fan)).toBeLessThan(area(free));
    expect(area(fan)).toBeGreaterThan(0);
  });

  it("can't reach past its links or inside its hole", () => {
    expect(arcsAt(free, 0.6)).toEqual([]);
    expect(arcsAt(free, 0.05)).toEqual([]);
  });
});
