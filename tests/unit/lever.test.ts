import { describe, expect, it } from "vitest";
import {
  G,
  holdingTorque,
  leverArm,
  maxMass,
  verdict,
  XL430_STALL,
} from "../../src/demos/models/lever";

describe("holding a weight on an arm", () => {
  it("straight out, torque is weight times length", () => {
    expect(holdingTorque(0.5, 0.2, 0)).toBeCloseTo(0.5 * G * 0.2);
    expect(leverArm(0.2, 0)).toBeCloseTo(0.2);
  });

  it("straight up, it costs nothing; at 60° it costs half", () => {
    expect(holdingTorque(0.5, 0.2, 90)).toBeCloseTo(0);
    expect(holdingTorque(0.5, 0.2, 60)).toBeCloseTo(
      holdingTorque(0.5, 0.2, 0) / 2,
    );
    expect(holdingTorque(0.5, 0.2, -60)).toBeCloseTo(
      holdingTorque(0.5, 0.2, 60),
    );
  });

  it("doubling the length doubles the torque", () => {
    expect(holdingTorque(1, 0.3, 0)).toBeCloseTo(2 * holdingTorque(1, 0.15, 0));
  });

  it("the XL430 holds 0.5 kg at 20 cm but not 1 kg at 20 cm", () => {
    expect(verdict(holdingTorque(0.5, 0.2, 0))).toBe("holds");
    expect(verdict(holdingTorque(1, 0.2, 0))).toBe("sags");
    expect(maxMass(0.2, 0)).toBeCloseTo(XL430_STALL / (G * 0.2));
    expect(maxMass(0.2, 90)).toBe(Infinity);
  });
});
