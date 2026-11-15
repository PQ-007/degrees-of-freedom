// An analog-to-digital converter (ADC): pure, no DOM (tests/unit/adc.test.ts).
//
// An n-bit converter can give 2^n different numbers. It splits the range from
// 0 to its reference voltage V_ref into 2^n equal steps of
//
//   Δ = V_ref / 2^n
//
// and reports which step the voltage v is in, k = ⌊v / Δ⌋, from 0 up to
// 2^n − 1. Everything inside one step reads the same, so the reading is
// always up to one step below the true voltage: 0 ≤ v − kΔ < Δ.

/** How many different numbers n bits can hold. */
export const levels = (bits: number): number => 2 ** bits;

/** The width of one step, in volts. */
export const stepSize = (bits: number, vref: number): number =>
  vref / levels(bits);

/** The number an n-bit converter reports for voltage v (clamped to its range). */
export function reading(v: number, bits: number, vref: number): number {
  const k = Math.floor(v / stepSize(bits, vref));
  return Math.min(Math.max(k, 0), levels(bits) - 1);
}

/** The voltage a reading stands for: the bottom of its step. */
export const voltageOf = (k: number, bits: number, vref: number): number =>
  k * stepSize(bits, vref);

/** A reading written in binary, with all n digits (leading zeros kept). */
export const binary = (k: number, bits: number): string =>
  k.toString(2).padStart(bits, "0");

/** The demo's sensor: a smooth voltage between 0.4 and 4.6 V over 1 s. */
export const signal = (t: number): number =>
  2.5 +
  1.6 * Math.sin(2 * Math.PI * t) +
  0.5 * Math.sin(2 * Math.PI * 3 * t + 1);
