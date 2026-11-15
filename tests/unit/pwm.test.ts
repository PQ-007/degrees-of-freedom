import { describe, expect, it } from "vitest";
import {
  averageVoltage,
  ripple,
  speedRange,
  waveform,
} from "../../src/demos/models/pwm";

describe("PWM driving a motor", () => {
  it("the average voltage is the duty cycle times the supply", () => {
    expect(averageVoltage(0.5, 12)).toBe(6);
    expect(averageVoltage(0.25, 5)).toBeCloseTo(1.25);
  });

  it("the motor's average speed equals the duty cycle", () => {
    const w = waveform(0.3, 20, 1, 4000);
    const mean =
      w.slice(0, -1).reduce((acc, p) => acc + p[2], 0) / (w.length - 1);
    expect(mean).toBeCloseTo(0.3, 2);
  });

  it("the steady state repeats: it ends each period where it began", () => {
    const w = waveform(0.6, 10, 1, 4000);
    expect(w.at(-1)?.[2]).toBeCloseTo(w[0]?.[2] ?? 0, 4);
  });

  it("faster switching, smaller ripple", () => {
    expect(ripple(0.5, 5)).toBeGreaterThan(ripple(0.5, 50));
    expect(ripple(0.5, 50)).toBeGreaterThan(ripple(0.5, 500));
    expect(ripple(0.5, 500)).toBeLessThan(0.01);
  });

  it("fully off or fully on, no ripple", () => {
    expect(speedRange(0, 10)).toEqual({ min: 0, max: 0 });
    expect(speedRange(1, 10)).toEqual({ min: 1, max: 1 });
  });
});
