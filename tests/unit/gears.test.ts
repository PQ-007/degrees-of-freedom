import { describe, expect, it } from "vitest";
import {
  follow,
  gearOutline,
  idealOutput,
  outputSpeed,
  outputTorque,
  ratio,
} from "../../src/demos/models/gears";

describe("a pair of gears", () => {
  it("trades speed for torque by the ratio of their teeth, keeping the power", () => {
    const n = ratio(12, 48);
    expect(n).toBe(4);
    expect(outputSpeed(6000, n)).toBe(1500);
    expect(outputTorque(0.05, n)).toBeCloseTo(0.2, 12);
    expect(outputTorque(0.05, n, 0.9)).toBeCloseTo(0.18, 12);
    const power = (tau: number, rpm: number) => tau * rpm;
    expect(power(outputTorque(0.05, n), outputSpeed(6000, n))).toBeCloseTo(
      power(0.05, 6000),
      9,
    );
  });

  it("turns the output the other way, N times less", () => {
    expect(idealOutput(360, 4)).toBe(-90);
    // Ratios of two stages multiply.
    expect(ratio(10, 24) * ratio(12, 30)).toBeCloseTo(6, 12);
  });

  it("with no backlash, the output follows exactly", () => {
    let out = 0;
    for (const m of [0, 40, 80, 40, 0]) out = follow(out, idealOutput(m, 4), 0);
    expect(out).toBeCloseTo(0, 12);
  });

  it("with backlash, the output stays still for a while when the motor reverses", () => {
    const gap = 4; // degrees at the output
    let out = 0;
    out = follow(out, idealOutput(80, 4), gap); // ideal −20: trails by 2
    expect(out).toBe(-18);
    // Reverse by 12° of motor (3° of output): still inside the gap.
    out = follow(out, idealOutput(68, 4), gap);
    expect(out).toBe(-18);
    // Reverse further: the far side of the gap now pushes it back.
    out = follow(out, idealOutput(40, 4), gap);
    expect(out).toBe(-12);
  });

  it("draws z teeth, four points each, between the root and tip circles", () => {
    const pts = gearOutline(12, 30);
    expect(pts).toHaveLength(48);
    const radii = pts.map(([x, y]) => Math.hypot(x, y));
    const m = 5;
    expect(Math.max(...radii)).toBeCloseTo(30 + m, 9);
    expect(Math.min(...radii)).toBeCloseTo(30 - 1.25 * m, 9);
  });
});
