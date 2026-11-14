import { describe, expect, it } from "vitest";
import { createPid } from "../../src/demos/models/pid";

describe("createPid", () => {
  it("adds the three terms", () => {
    const pid = createPid({ kp: 2, ki: 1, kd: 0.5 });
    // P = 2·1, I = 1·(1·0.1), D from the measured rate = 0.5·4
    expect(pid.update(1, 0.1, 4)).toBeCloseTo(2 + 0.1 + 2);
    expect(pid.last.p).toBeCloseTo(2);
    expect(pid.last.i).toBeCloseTo(0.1);
    expect(pid.last.d).toBeCloseTo(2);
  });

  it("differences the error when no rate is measured", () => {
    const pid = createPid({ kp: 0, ki: 0, kd: 1 });
    expect(pid.update(0, 0.1)).toBe(0); // the first update has nothing to compare with
    expect(pid.update(0.5, 0.1)).toBeCloseTo(5);
  });

  it("limits the output and stops the integral winding up while saturated", () => {
    const pid = createPid({ kp: 0, ki: 10, kd: 0 }, 1);
    for (let i = 0; i < 100; i++) pid.update(1, 0.1);
    expect(pid.last.out).toBe(1);
    // The integral stopped near the limit, so one step of opposite error
    // brings the output straight back down instead of staying stuck at 1.
    expect(pid.update(-1, 0.1)).toBeLessThan(1);
    expect(pid.last.i).toBeLessThan(1.1);
  });

  it("forgets everything on reset", () => {
    const pid = createPid({ kp: 1, ki: 1, kd: 1 });
    pid.update(1, 0.1);
    pid.update(2, 0.1);
    pid.reset();
    expect(pid.update(0, 0.1)).toBe(0);
  });
});
