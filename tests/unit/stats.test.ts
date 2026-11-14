import { describe, expect, it } from "vitest";
import {
  gaussian,
  histogram,
  mean,
  normalPdf,
  posterior,
  seeded,
  std,
  takeReadings,
} from "../../src/demos/models/stats";

describe("noise and averages", () => {
  it("the seeded generator repeats", () => {
    const a = seeded(7);
    const b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("Gaussian samples have the asked-for mean and spread", () => {
    const r = seeded(1);
    const xs = Array.from({ length: 20000 }, () => gaussian(r, 2, 0.1));
    expect(mean(xs)).toBeCloseTo(2, 2);
    expect(std(xs)).toBeCloseTo(0.1, 2);
    // About 68% within one standard deviation, about 95% within two.
    const within = (k: number) =>
      xs.filter((x) => Math.abs(x - 2) < k * 0.1).length / xs.length;
    expect(within(1)).toBeGreaterThan(0.66);
    expect(within(1)).toBeLessThan(0.7);
    expect(within(2)).toBeGreaterThan(0.94);
    expect(within(2)).toBeLessThan(0.96);
  });

  it("averaging n readings narrows the spread to σ/√n", () => {
    const { singles, averages } = takeReadings({
      truth: 2,
      sd: 0.1,
      n: 16,
      trials: 4000,
      seed: 3,
    });
    expect(std(singles)).toBeCloseTo(0.1, 2);
    expect(std(averages)).toBeCloseTo(0.1 / 4, 2);
    expect(mean(averages)).toBeCloseTo(2, 2);
  });

  it("counts values into bins", () => {
    expect(histogram([0.1, 0.2, 0.6, 0.9, 1.5, -1], 0, 1, 2)).toEqual([2, 2]);
  });

  it("the normal curve's area is 1", () => {
    let area = 0;
    for (let x = -1; x <= 1; x += 0.001) area += normalPdf(x, 0, 0.1) * 0.001;
    expect(area).toBeCloseTo(1, 3);
  });

  it("Bayes' rule: a rare thing makes most alarms false", () => {
    // The page's example: 1 in 100, hit 95%, false alarm 2%: about 1 in 3.
    expect(posterior({ prior: 0.01, hit: 0.95, falseAlarm: 0.02 })).toBeCloseTo(
      0.324,
      3,
    );
  });
});
