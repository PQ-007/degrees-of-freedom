// A PID controller: pure, no DOM (tests/unit/pid.test.ts).
//
//   output = Kp·e + Ki·∫e dt + Kd·de/dt, then limited to ±limit
//
// Two details every real PID needs:
// - The derivative uses the measured rate when there is one (a gyro, an
//   encoder's speed), instead of differencing the error, which amplifies noise.
// - The integral stops growing while the output is at its limit
//   ("anti-windup"), so it doesn't overshoot when the output comes back.

export interface PidGains {
  kp: number;
  ki: number;
  kd: number;
}

export interface Pid {
  /**
   * One update. `error` is target − measurement (or the sign convention the
   * caller chose); `rate` is the error's rate of change if it is measured.
   */
  update(error: number, dt: number, rate?: number): number;
  reset(): void;
  gains: PidGains;
  /** The parts of the last output, for showing what each term did. */
  last: { p: number; i: number; d: number; out: number };
}

export function createPid(gains: PidGains, limit = Infinity): Pid {
  let integral = 0;
  let prevError: number | undefined;
  const pid: Pid = {
    gains: { ...gains },
    last: { p: 0, i: 0, d: 0, out: 0 },
    update(error, dt, rate) {
      const { kp, ki, kd } = pid.gains;
      const derivative =
        rate ??
        (prevError === undefined || dt <= 0 ? 0 : (error - prevError) / dt);
      prevError = error;
      const p = kp * error;
      const d = kd * derivative;
      const next = integral + error * dt;
      const unclamped = p + ki * next + d;
      // Anti-windup: only integrate while the output isn't saturated, or when
      // the error would pull it back out of saturation.
      if (
        Math.abs(unclamped) <= limit ||
        Math.sign(error) !== Math.sign(unclamped)
      )
        integral = next;
      const i = ki * integral;
      const out = Math.max(-limit, Math.min(limit, p + i + d));
      pid.last = { p, i, d, out };
      return out;
    },
    reset() {
      integral = 0;
      prevError = undefined;
      pid.last = { p: 0, i: 0, d: 0, out: 0 };
    },
  };
  return pid;
}
