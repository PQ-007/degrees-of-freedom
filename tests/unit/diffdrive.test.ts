import { describe, expect, it } from "vitest";
import {
  body,
  path,
  poseAt,
  radius,
  wheelAt,
  type Pose,
} from "../../src/demos/models/diffdrive";

const W = 0.3;
const up: Pose = { x: 0, y: 0, heading: Math.PI / 2 };

describe("a differential-drive robot", () => {
  it("drives straight when both wheels match", () => {
    expect(body(0.2, 0.2, W)).toEqual({ v: 0.2, omega: 0 });
    expect(radius(0.2, 0.2, W)).toBe(Infinity);
    const p = poseAt(up, 0.2, 0.2, W, 2);
    expect(p.x).toBeCloseTo(0, 12);
    expect(p.y).toBeCloseTo(0.4, 12);
  });

  it("spins in place when the wheels turn opposite ways", () => {
    expect(radius(-0.15, 0.15, W)).toBeCloseTo(0, 12);
    const p = poseAt(up, -0.15, 0.15, W, 1);
    expect(Math.hypot(p.x, p.y)).toBeCloseTo(0, 12);
    expect(p.heading - up.heading).toBeCloseTo(1, 12); // 0.3/0.3 rad/s
  });

  it("pivots about a stopped wheel, half the track away", () => {
    expect(radius(0, 0.2, W)).toBeCloseTo(W / 2, 12);
    // The stopped left wheel stays where it is.
    const before = wheelAt(up, W, 1);
    for (const p of path(up, 0, 0.2, W, 3, 30)) {
      const w = wheelAt(p, W, 1);
      expect(w.x).toBeCloseTo(before.x, 9);
      expect(w.y).toBeCloseTo(before.y, 9);
    }
  });

  it("follows a circle of radius v/ω round a point on the axle's line", () => {
    const R = radius(0.1, 0.2, W); // v 0.15, ω 1/3 → 0.45 m to the left
    expect(R).toBeCloseTo(0.45, 12);
    const centre = { x: -R, y: 0 };
    for (const p of path(up, 0.1, 0.2, W, 4, 20))
      expect(Math.hypot(p.x - centre.x, p.y - centre.y)).toBeCloseTo(R, 9);
  });
});
