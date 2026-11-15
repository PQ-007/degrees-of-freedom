// Holding a weight on an arm: pure, no DOM (tests/unit/lever.test.ts).
//
// A motor at the shoulder holds a weight of mass m at the end of an arm of
// length L, raised θ from horizontal. Gravity pulls the weight straight down
// with force m·g; what turns the joint is that force times its lever arm, the
// horizontal distance from the joint to the line of the force:
//
//   τ = m · g · L · cos θ
//
// so the same weight is hardest to hold with the arm straight out (θ = 0)
// and costs nothing straight up (θ = 90°). The arm itself is taken as
// weightless.

/** Standard gravity, m/s² (exact, NIST). */
export const G = 9.80665;

/** The reference motor: DYNAMIXEL XL430-W250-T stall torque at 11.1 V, N·m. */
export const XL430_STALL = 1.4;

export const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** The horizontal lever arm, m. */
export function leverArm(length: number, angleDeg: number): number {
  return length * Math.cos(toRadians(angleDeg));
}

/** The torque needed to hold the weight still, N·m (sign dropped). */
export function holdingTorque(
  mass: number,
  length: number,
  angleDeg: number,
): number {
  return Math.abs(mass * G * leverArm(length, angleDeg));
}

export type Verdict = "holds" | "sags";

export function verdict(torque: number, available = XL430_STALL): Verdict {
  return torque <= available ? "holds" : "sags";
}

/** The heaviest mass the motor can hold at this length and angle, kg. */
export function maxMass(
  length: number,
  angleDeg: number,
  available = XL430_STALL,
): number {
  const arm = Math.abs(leverArm(length, angleDeg));
  return arm < 1e-9 ? Infinity : available / (G * arm);
}
