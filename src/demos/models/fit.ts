// Fitting a line by gradient descent: pure, no DOM (tests/unit/fit.test.ts).
//
// Calibrating a distance sensor: for a few true distances y we have the
// sensor's readings x, and want the line y ≈ a·x + b that corrects them. The
// cost is the mean squared error
//
//   J(a, b) = (1/N) Σ (a·xᵢ + b − yᵢ)²
//
// a bowl in (a, b). Gradient descent steps downhill: (a, b) −= η·∇J. Because
// J is quadratic, its gradient is linear: ∇J = H·(θ − θ*), with the constant
// Hessian H. Each step multiplies the distance to the best line θ* by
// (I − ηH), so it converges only if η < 2/λmax (λmax: H's larger eigenvalue).
import { gaussian, seeded } from "./stats";

export interface Point {
  x: number;
  y: number;
}
export type Params = [number, number]; // [a, b]

/** The calibration data: 12 readings of distances from 0.3 to 2 m. */
export function calibrationData(seed = 4): Point[] {
  const rand = seeded(seed);
  const points: Point[] = [];
  for (let i = 0; i < 12; i++) {
    const y = 0.3 + (1.7 * i) / 11; // true distance, m
    // The sensor reads about 10% short, plus 6 cm, plus noise.
    const x = 0.9 * y + 0.06 + gaussian(rand, 0, 0.03);
    points.push({ x, y });
  }
  return points;
}

export function cost(p: Params, data: readonly Point[]): number {
  const [a, b] = p;
  return data.reduce((s, d) => s + (a * d.x + b - d.y) ** 2, 0) / data.length;
}

export function gradient(p: Params, data: readonly Point[]): Params {
  const [a, b] = p;
  let ga = 0;
  let gb = 0;
  for (const d of data) {
    const r = a * d.x + b - d.y;
    ga += r * d.x;
    gb += r;
  }
  const n = data.length;
  return [(2 * ga) / n, (2 * gb) / n];
}

/** The constant Hessian of J: (2/N)·[[Σx², Σx], [Σx, N]]. */
export function hessian(
  data: readonly Point[],
): [[number, number], [number, number]] {
  const n = data.length;
  const sx = data.reduce((s, d) => s + d.x, 0);
  const sxx = data.reduce((s, d) => s + d.x * d.x, 0);
  return [
    [(2 * sxx) / n, (2 * sx) / n],
    [(2 * sx) / n, 2],
  ];
}

/** Eigenvalues (small, large) and unit eigenvectors of a symmetric 2×2 matrix. */
export function eigen(m: [[number, number], [number, number]]) {
  const [[p, q], [, r]] = m;
  const mid = (p + r) / 2;
  const d = Math.sqrt(((p - r) / 2) ** 2 + q * q);
  const values: [number, number] = [mid - d, mid + d];
  const vectors = values.map((l) => {
    const v: Params =
      Math.abs(q) > 1e-12 ? [q, l - p] : l === p ? [1, 0] : [0, 1];
    const len = Math.hypot(v[0], v[1]);
    return [v[0] / len, v[1] / len] as Params;
  }) as [Params, Params];
  return { values, vectors };
}

/** The best line, solved directly (least squares, via the normal equations). */
export function leastSquares(data: readonly Point[]): Params {
  const n = data.length;
  const sx = data.reduce((s, d) => s + d.x, 0);
  const sy = data.reduce((s, d) => s + d.y, 0);
  const sxx = data.reduce((s, d) => s + d.x * d.x, 0);
  const sxy = data.reduce((s, d) => s + d.x * d.y, 0);
  const a = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return [a, (sy - a * sx) / n];
}

/** `steps` steps of gradient descent with step size η, from `start`. */
export function descend(
  start: Params,
  eta: number,
  steps: number,
  data: readonly Point[],
): Params[] {
  const path: Params[] = [start];
  let p = start;
  for (let k = 0; k < steps; k++) {
    const g = gradient(p, data);
    p = [p[0] - eta * g[0], p[1] - eta * g[1]];
    path.push(p);
  }
  return path;
}

export type Descent = "smooth" | "zigzag" | "diverges";

/** How descent with step η behaves on this data. */
export function behaviour(eta: number, data: readonly Point[]): Descent {
  const { values } = eigen(hessian(data));
  const big = values[1];
  if (eta * big <= 1 + 1e-9) return "smooth";
  if (eta * big < 2 - 1e-9) return "zigzag";
  return "diverges";
}

/** Points on the contour J = J* + c, an ellipse around the best line. */
export function contour(data: readonly Point[], c: number, n = 72): Params[] {
  const best = leastSquares(data);
  const { values, vectors } = eigen(hessian(data));
  const r = values.map((l) => Math.sqrt((2 * c) / l));
  const pts: Params[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    const u = (r[0] ?? 0) * Math.cos(t);
    const v = (r[1] ?? 0) * Math.sin(t);
    pts.push([
      best[0] + u * vectors[0][0] + v * vectors[1][0],
      best[1] + u * vectors[0][1] + v * vectors[1][1],
    ]);
  }
  return pts;
}
