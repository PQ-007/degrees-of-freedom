// A motor spinning up, exactly and in Euler steps: pure, no DOM
// (tests/unit/euler.test.ts).
//
// The speed v changes in proportion to how far it is from its final speed V:
//
//   dv/dt = (V − v) / τ,   exactly v(t) = V · (1 − e^(−t/τ))
//
// Euler's method follows the slope for one step h at a time:
//
//   v[k+1] = v[k] + h · (V − v[k]) / τ
//
// so the gap to V is multiplied by (1 − h/τ) at every step. With h ≤ τ it
// shrinks without overshooting; with τ < h < 2τ it changes sign each step but
// shrinks (overshoots, then settles); with h ≥ 2τ it never shrinks.

export interface SpinUp {
  /** Final speed V, rad/s. */
  target: number;
  /** Time constant τ, s. */
  tau: number;
  /** How long to show, s. */
  duration: number;
}

export const SPIN_UP: SpinUp = { target: 10, tau: 0.3, duration: 2 };

export function exact(t: number, s: SpinUp = SPIN_UP): number {
  return s.target * (1 - Math.exp(-t / s.tau));
}

export function slope(v: number, s: SpinUp = SPIN_UP): number {
  return (s.target - v) / s.tau;
}

export interface Step {
  t: number;
  v: number;
}

/** Euler's steps of size h from v = 0, up to the duration. */
export function eulerSteps(h: number, s: SpinUp = SPIN_UP): Step[] {
  const n = Math.floor(s.duration / h + 1e-9);
  const steps: Step[] = [{ t: 0, v: 0 }];
  let v = 0;
  for (let k = 1; k <= n; k++) {
    v += h * slope(v, s);
    steps.push({ t: k * h, v });
  }
  return steps;
}

/** The largest gap between the steps and the true curve. */
export function maxError(h: number, s: SpinUp = SPIN_UP): number {
  return Math.max(
    ...eulerSteps(h, s).map((p) => Math.abs(p.v - exact(p.t, s))),
  );
}

export type Behaviour = "follows" | "overshoots" | "unstable";

export function behaviour(h: number, s: SpinUp = SPIN_UP): Behaviour {
  if (h <= s.tau + 1e-9) return "follows";
  if (h < 2 * s.tau - 1e-9) return "overshoots";
  return "unstable";
}
