import { describe, expect, it } from "vitest";
import {
  mul,
  rotation,
  toDegrees,
  toRadians,
  toRobot,
  toWorld,
  transpose,
  type Vec2,
} from "../../src/demos/models/frames";

const close = (a: Vec2, b: Vec2) => {
  expect(a[0]).toBeCloseTo(b[0]);
  expect(a[1]).toBeCloseTo(b[1]);
};

describe("frames in the plane", () => {
  it("converts degrees and radians", () => {
    expect(toRadians(180)).toBeCloseTo(Math.PI);
    expect(toDegrees(Math.PI / 2)).toBeCloseTo(90);
  });

  it("a quarter turn takes x to y", () => {
    close(mul(rotation(Math.PI / 2), [1, 0]), [0, 1]);
  });

  it("a rotation's transpose undoes it", () => {
    const r = rotation(0.7);
    close(mul(transpose(r), mul(r, [2, -1])), [2, -1]);
  });

  it("a point ahead of a robot facing +y is above it on the map", () => {
    const pose = { x: 1, y: 2, theta: Math.PI / 2 };
    close(toWorld([1, 0], pose), [1, 3]);
    close(toRobot([1, 3], pose), [1, 0]);
  });

  it("toRobot undoes toWorld for any pose", () => {
    const pose = { x: -0.4, y: 3.1, theta: -2.2 };
    close(toRobot(toWorld([1.5, 0.5], pose), pose), [1.5, 0.5]);
  });
});
