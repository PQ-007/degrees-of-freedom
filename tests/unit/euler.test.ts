import { describe, expect, it } from "vitest";
import {
  SPIN_UP,
  behaviour,
  eulerSteps,
  exact,
  maxError,
} from "../../src/demos/models/euler";

describe("a motor spinning up", () => {
  it("reaches about 63% of its final speed after one time constant", () => {
    expect(exact(SPIN_UP.tau)).toBeCloseTo(10 * (1 - Math.exp(-1)));
    expect(exact(0)).toBe(0);
  });

  it("Euler's error shrinks roughly in proportion to the step", () => {
    const e1 = maxError(0.02);
    const e2 = maxError(0.01);
    expect(e1 / e2).toBeGreaterThan(1.8);
    expect(e1 / e2).toBeLessThan(2.2);
  });

  it("a step of exactly τ lands on the final speed in one step", () => {
    expect(eulerSteps(SPIN_UP.tau)[1]?.v).toBeCloseTo(SPIN_UP.target);
  });

  it("τ < h < 2τ overshoots, then settles", () => {
    const steps = eulerSteps(0.45);
    expect(steps[1]?.v).toBeGreaterThan(SPIN_UP.target);
    expect(Math.abs((steps.at(-1)?.v ?? 0) - SPIN_UP.target)).toBeLessThan(2);
    expect(behaviour(0.45)).toBe("overshoots");
  });

  it("h > 2τ swings wider and wider", () => {
    const gaps = eulerSteps(0.7).map((p) => Math.abs(p.v - SPIN_UP.target));
    expect(gaps.at(-1)).toBeGreaterThan(gaps[0] ?? 0);
    expect(behaviour(0.7)).toBe("unstable");
    expect(behaviour(0.1)).toBe("follows");
  });

  it("covers the whole duration", () => {
    expect(eulerSteps(0.5).map((p) => p.t)).toEqual([0, 0.5, 1, 1.5, 2]);
  });
});
