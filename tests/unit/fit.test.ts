import { describe, expect, it } from "vitest";
import {
  behaviour,
  calibrationData,
  contour,
  cost,
  descend,
  eigen,
  gradient,
  hessian,
  leastSquares,
} from "../../src/demos/models/fit";

const data = calibrationData();

describe("fitting a line", () => {
  it("least squares recovers a line through exact points", () => {
    const exact = [0, 1, 2, 3].map((x) => ({ x, y: 2 * x - 1 }));
    const [a, b] = leastSquares(exact);
    expect(a).toBeCloseTo(2);
    expect(b).toBeCloseTo(-1);
  });

  it("the gradient is zero at the least-squares line", () => {
    const g = gradient(leastSquares(data), data);
    expect(Math.abs(g[0])).toBeLessThan(1e-9);
    expect(Math.abs(g[1])).toBeLessThan(1e-9);
  });

  it("the calibration undoes a sensor that reads about 10% short", () => {
    const [a, b] = leastSquares(data);
    expect(a).toBeGreaterThan(1.0);
    expect(a).toBeLessThan(1.25);
    expect(b).toBeLessThan(0);
  });

  it("a small step converges to the least-squares line", () => {
    const eta = 0.9 / eigen(hessian(data)).values[1];
    const end = descend([0, 0], eta, 4000, data).at(-1) ?? [0, 0];
    const best = leastSquares(data);
    expect(end[0]).toBeCloseTo(best[0], 3);
    expect(end[1]).toBeCloseTo(best[1], 3);
    expect(behaviour(eta, data)).toBe("smooth");
  });

  it("past 2/λmax the cost grows instead of shrinking", () => {
    const eta = 2.1 / eigen(hessian(data)).values[1];
    const path = descend([0, 0], eta, 60, data);
    expect(cost(path.at(-1) ?? [0, 0], data)).toBeGreaterThan(
      cost([0, 0], data),
    );
    expect(behaviour(eta, data)).toBe("diverges");
    expect(behaviour(1.5 / eigen(hessian(data)).values[1], data)).toBe(
      "zigzag",
    );
  });

  it("every point on a contour has the same cost", () => {
    const best = cost(leastSquares(data), data);
    for (const p of contour(data, 0.05, 12))
      expect(cost(p, data)).toBeCloseTo(best + 0.05);
  });
});
