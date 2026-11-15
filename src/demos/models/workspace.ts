// The workspace of a planar arm with two revolute joints: pure, no DOM
// (tests/unit/workspace.test.ts).
//
// Link 1 (length l1) turns at the shoulder by q1, limited to |q1| ≤ b; link 2
// (length l2) turns at the elbow by q2, limited to |q2| ≤ a. The tip is
//
//   x = l1 cos q1 + l2 cos(q1 + q2),   y = l1 sin q1 + l2 sin(q1 + q2).
//
// Its distance from the shoulder depends only on the elbow,
//
//   r² = l1² + l2² + 2 l1 l2 cos q2,
//
// so the elbow sets how far the tip is, and the shoulder swings it round.
// At distance r the elbow is bent by ±q2, which turns the tip off the line of
// link 1 by ±φ, φ = atan2(l2 sin q2, l1 + l2 cos q2). Swinging the shoulder
// through [−b, b] then covers the angles [±φ − b, ±φ + b]: two arcs, which
// leave a gap in front when φ > b and a gap behind when φ + b < π.

const TAU = 2 * Math.PI;

export interface Arm {
  l1: number;
  l2: number;
  /** The shoulder's limit b, rad (π: it turns all the way round). */
  shoulder: number;
  /** The elbow's limit a, rad (π: it folds all the way back). */
  elbow: number;
}

/** The elbow (shoulder) and tip positions for joint angles q1, q2. */
export function forward(arm: Arm, q1: number, q2: number) {
  const elbow = { x: arm.l1 * Math.cos(q1), y: arm.l1 * Math.sin(q1) };
  return {
    elbow,
    tip: {
      x: elbow.x + arm.l2 * Math.cos(q1 + q2),
      y: elbow.y + arm.l2 * Math.sin(q1 + q2),
    },
  };
}

/** The tip's distance from the shoulder with the elbow bent by q2. */
export const distance = (arm: Arm, q2: number): number =>
  Math.sqrt(arm.l1 ** 2 + arm.l2 ** 2 + 2 * arm.l1 * arm.l2 * Math.cos(q2));

/** The nearest and farthest the tip can be from the shoulder. */
export function reach(arm: Arm) {
  return {
    min: distance(arm, Math.min(arm.elbow, Math.PI)),
    max: arm.l1 + arm.l2,
  };
}

/** The elbow bend (0…π) that puts the tip at distance r, if any. */
export function elbowFor(arm: Arm, r: number): number | undefined {
  const c = (r * r - arm.l1 ** 2 - arm.l2 ** 2) / (2 * arm.l1 * arm.l2);
  if (c > 1 + 1e-9 || c < -1 - 1e-9) return undefined;
  return Math.acos(Math.min(1, Math.max(-1, c)));
}

/** The arcs of directions (rad, as [from, to] with from < to) the tip can
 * reach at distance r; empty if it can't be that far. */
export function arcsAt(arm: Arm, r: number): [number, number][] {
  const q2 = elbowFor(arm, r);
  if (q2 === undefined || q2 > arm.elbow + 1e-9) return [];
  const b = Math.min(arm.shoulder, Math.PI);
  if (b >= Math.PI) return [[-Math.PI, Math.PI]];
  const phi = Math.atan2(arm.l2 * Math.sin(q2), arm.l1 + arm.l2 * Math.cos(q2));
  const front = phi > b; // a gap straight ahead, between the two arcs
  const back = phi + b < Math.PI; // a gap behind
  if (front && back)
    return [
      [-phi - b, -phi + b],
      [phi - b, phi + b],
    ];
  if (back) return [[-phi - b, phi + b]];
  if (front) return [[phi - b, TAU - phi + b]];
  return [[-Math.PI, Math.PI]];
}

/** How much of the circle at distance r the tip can reach, rad. */
export const coverAt = (arm: Arm, r: number): number =>
  arcsAt(arm, r).reduce((sum, [from, to]) => sum + (to - from), 0);

/** The workspace's area, m² (numerically, n rings). */
export function area(arm: Arm, n = 400): number {
  const { min, max } = reach(arm);
  const dr = (max - min) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const r = min + (i + 0.5) * dr;
    sum += r * coverAt(arm, r) * dr;
  }
  return sum;
}
