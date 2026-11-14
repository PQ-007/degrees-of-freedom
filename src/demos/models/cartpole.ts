// The cart-pole demo's controller and presets: pure, no DOM
// (tests/unit/cartpole.test.ts runs them in MuJoCo).
//
// The pole's tilt θ is the error: when the pole leans right, push the cart
// right, under it. PID on θ is the loop the reader tunes. A second, gentle
// loop with fixed gains keeps the cart near the middle of the rail; without
// it the pole can stand while the cart drifts into the end stop. (Its gains
// look backwards, positive on position: to bring the cart back left, the
// pole must first lean left, so the cart first moves right.)
import { createPid, type Pid, type PidGains } from "./pid";
import type { Controller, Replay, SimRunner, SimState } from "../../sim/runner";

export const CARTPOLE = {
  /** Controller runs per second. */
  rate: 100,
  /** The motor's limit, newtons (as in the model's ctrlrange). */
  forceLimit: 20,
  /** Starting tilt, radians (about 6°). */
  startTilt: 0.1,
  /** Tilt beyond which the pole counts as fallen, radians (about 45°). */
  fallen: Math.PI / 4,
  /** The Push button: a sideways force on the pole (at its centre of mass), newtons, seconds. */
  push: { force: 1, duration: 0.1 },
  /** The cart-centring loop (fixed). */
  centre: { kx: 2, kv: 3 },
} as const;

export interface Preset {
  id: "pd" | "p" | "low-p" | "high-d";
  gains: PidGains;
}

// Each preset's behaviour is checked in MuJoCo by tests/unit/cartpole.test.ts.
export const PRESETS: readonly Preset[] = [
  // Balances, and recovers from a push.
  { id: "pd", gains: { kp: 30, ki: 0, kd: 6 } },
  // Nothing damps the swing: it falls within about a second.
  { id: "p", gains: { kp: 30, ki: 0, kd: 0 } },
  // Too weak to catch the pole: it topples.
  { id: "low-p", gains: { kp: 8, ki: 0, kd: 6 } },
  // Stays up, but sluggish: the cart wanders along the rail.
  { id: "high-d", gains: { kp: 30, ki: 0, kd: 30 } },
];

/** The slider ranges. */
export const GAIN_RANGES: Record<
  keyof PidGains,
  { max: number; step: number }
> = {
  kp: { max: 100, step: 1 },
  ki: { max: 40, step: 1 },
  kd: { max: 40, step: 0.5 },
};

export interface CartpoleController extends Controller {
  pid: Pid;
}

export function cartpoleController(gains: PidGains): CartpoleController {
  const pid = createPid(gains, CARTPOLE.forceLimit);
  return {
    pid,
    rate: CARTPOLE.rate,
    control(s: SimState, dt: number) {
      const x = s.qpos[0] ?? 0;
      const theta = s.qpos[1] ?? 0;
      const v = s.qvel[0] ?? 0;
      const omega = s.qvel[1] ?? 0;
      const u =
        pid.update(theta, dt, omega) +
        CARTPOLE.centre.kx * x +
        CARTPOLE.centre.kv * v;
      return [Math.max(-CARTPOLE.forceLimit, Math.min(CARTPOLE.forceLimit, u))];
    },
    reset() {
      pid.reset();
    },
  };
}

/** The tilt, wrapped to −π…π (the hinge turns freely, so it can go round). */
export function tilt(qpos: Float64Array | number[]): number {
  const a = qpos[1] ?? 0;
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export function isFallen(qpos: Float64Array | number[]): boolean {
  return Math.abs(tilt(qpos)) > CARTPOLE.fallen;
}

/**
 * A recording of the default preset (P + D) for browsers without WebAssembly:
 * 12 s from the starting tilt, pushed at 3 s, at 30 frames a second. Made at
 * build time by src/pages/sim/cartpole-replay.json.ts with the real engine.
 */
export interface CartpoleReplay extends Replay {
  pushAt: number;
}

export function recordReplay(sim: SimRunner): CartpoleReplay {
  const fps = 30;
  const pushAt = 3;
  const preset = PRESETS[0];
  if (!preset) throw new Error("no presets");
  sim.controller = cartpoleController(preset.gains);
  sim.reset([0, CARTPOLE.startTilt]);
  const frames: number[][] = [];
  const round = (v: number) => Math.round(v * 1e4) / 1e4;
  for (let f = 0; f <= 12 * fps; f++) {
    const t = f / fps;
    while (sim.data.time < t - sim.timestep / 2) {
      if (Math.abs(sim.data.time - pushAt) < sim.timestep / 2)
        sim.push("pole", [CARTPOLE.push.force, 0, 0], CARTPOLE.push.duration);
      sim.step();
    }
    const q = sim.data.qpos as Float64Array;
    const u = (sim.data.ctrl as Float64Array)[0] ?? 0;
    frames.push([sim.data.time, q[0] ?? 0, q[1] ?? 0, u].map(round));
  }
  return { fps, nq: 2, pushAt, frames };
}
