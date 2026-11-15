import { describe, expect, it } from "vitest";
import {
  emf,
  flux,
  fluxSlope,
  motion,
  peakEmf,
  SETUP,
} from "../../src/demos/models/induction";

describe("a magnet moving through a coil", () => {
  it("the flux is largest at the coil's centre and falls away", () => {
    expect(flux(0)).toBeGreaterThan(flux(0.02));
    expect(flux(0.02)).toBeCloseTo(flux(-0.02));
    expect(fluxSlope(0)).toBeCloseTo(0, 12);
  });

  it("the slope matches the flux's change", () => {
    const h = 1e-6;
    expect(fluxSlope(0.015)).toBeCloseTo(
      (flux(0.015 + h) - flux(0.015 - h)) / (2 * h),
      8,
    );
  });

  it("no motion, no voltage", () => {
    expect(emf(200, 0.02, 0)).toBe(0);
  });

  it("moving in and moving out give opposite voltages", () => {
    expect(Math.sign(emf(200, 0.02, -1))).toBe(-Math.sign(emf(200, 0.02, 1)));
  });

  it("twice the turns, or twice as fast, twice the peak voltage", () => {
    expect(peakEmf(400, 1)).toBeCloseTo(2 * peakEmf(200, 1), 6);
    expect(peakEmf(200, 2)).toBeCloseTo(2 * peakEmf(200, 1), 6);
  });

  it("the swing stays within its amplitude", () => {
    for (let t = 0; t < 1; t += 0.05) {
      expect(Math.abs(motion(t, 1.3).x)).toBeLessThanOrEqual(
        SETUP.amplitude + 1e-12,
      );
    }
  });
});
