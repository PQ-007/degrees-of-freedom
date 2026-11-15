import { describe, expect, it } from "vitest";
import {
  binary,
  levels,
  reading,
  signal,
  stepSize,
  voltageOf,
} from "../../src/demos/models/adc";

describe("an n-bit converter", () => {
  it("has 2^n numbers; 10 bits on 5 V gives 0–1023 in steps of 5/1024 V", () => {
    expect(levels(1)).toBe(2);
    expect(levels(10)).toBe(1024);
    expect(stepSize(10, 5)).toBeCloseTo(5 / 1024, 12);
    expect(reading(0, 10, 5)).toBe(0);
    expect(reading(5, 10, 5)).toBe(1023);
    expect(reading(2.5, 10, 5)).toBe(512);
  });

  it("clamps voltages outside its range", () => {
    expect(reading(-1, 8, 5)).toBe(0);
    expect(reading(9, 8, 5)).toBe(255);
  });

  it("reads up to one step below the true voltage, never above", () => {
    for (const bits of [1, 3, 8, 12]) {
      const d = stepSize(bits, 5);
      for (let i = 0; i <= 200; i++) {
        const v = signal(i / 200);
        const err = v - voltageOf(reading(v, bits, 5), bits, 5);
        expect(err).toBeGreaterThanOrEqual(0);
        expect(err).toBeLessThan(d);
      }
    }
  });

  it("writes readings in binary with every digit", () => {
    expect(binary(5, 4)).toBe("0101");
    expect(binary(1023, 10)).toBe("1111111111");
    expect(binary(0, 3)).toBe("000");
  });

  it("the demo's sensor stays inside 0–5 V", () => {
    for (let i = 0; i <= 1000; i++) {
      const v = signal(i / 1000);
      expect(v).toBeGreaterThan(0.3);
      expect(v).toBeLessThan(4.7);
    }
  });
});
