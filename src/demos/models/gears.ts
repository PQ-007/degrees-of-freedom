// A pair of spur gears with backlash: pure, no DOM (tests/unit/gears.test.ts).
//
// A small gear with z_in teeth on the motor drives a bigger one with z_out
// teeth. The gear ratio is N = z_out / z_in: the output turns N times slower,
// the other way, and (with no losses) with N times the torque, so the power
// τ·ω stays the same.
//
// Backlash is the play between the teeth: a gap g (measured at the output)
// that the output can rattle in without the motor moving. While the motor
// pushes one way, the output trails its ideal angle by g/2; when the motor
// reverses, the output stays still until the motor has taken up the whole gap.

export const ratio = (zIn: number, zOut: number): number => zOut / zIn;

/** Output speed for a motor speed (any unit): N times slower. */
export const outputSpeed = (motor: number, n: number): number => motor / n;

/** Output torque for a motor torque, with efficiency η (1: no losses). */
export const outputTorque = (motor: number, n: number, eta = 1): number =>
  eta * n * motor;

/** The output's ideal angle (deg) when the motor has turned by `motor` deg:
 * N times smaller, and the other way round. */
export const idealOutput = (motor: number, n: number): number => -motor / n;

/** Where the output ends up, from where it was, when its ideal angle moves:
 * it only moves once the motor pushes it from one side of the gap or the
 * other. */
export function follow(out: number, ideal: number, gap: number): number {
  const half = gap / 2;
  if (out < ideal - half) return ideal - half;
  if (out > ideal + half) return ideal + half;
  return out;
}

/** A gear's outline as [x, y] points in its own frame, y up: z trapezoid
 * teeth on a pitch circle of radius r (module m = 2r/z), the first tooth
 * centred at angle `phase` (rad). */
export function gearOutline(
  z: number,
  r: number,
  phase = 0,
): [number, number][] {
  const m = (2 * r) / z;
  const tip = r + m;
  const root = r - 1.25 * m;
  const p = (2 * Math.PI) / z;
  const pts: [number, number][] = [];
  const at = (rad: number, a: number): [number, number] => [
    rad * Math.cos(a),
    rad * Math.sin(a),
  ];
  for (let i = 0; i < z; i++) {
    const a = phase + i * p;
    pts.push(
      at(root, a - 0.3 * p),
      at(tip, a - 0.13 * p),
      at(tip, a + 0.13 * p),
      at(root, a + 0.3 * p),
    );
  }
  return pts;
}
