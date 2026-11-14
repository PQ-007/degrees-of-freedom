// Runs a MuJoCo model with a controller: no DOM, so the same code drives the
// browser demo, the replay recorded at build time and the unit tests.
//
// Physics steps at the model's timestep (2 ms for the cart-pole); the
// controller runs at its own, slower rate and its output is held between runs,
// the way a real controller on a microcontroller works.
import type { MainModule, MjData, MjModel } from "@mujoco/mujoco";

export type Mujoco = MainModule;

export interface Controller {
  /** Runs per second (Hz). */
  rate: number;
  /** Returns the actuator commands (one per actuator). */
  control(state: SimState, dt: number): number[];
  reset(): void;
}

export interface SimState {
  time: number;
  qpos: Float64Array;
  qvel: Float64Array;
  ctrl: Float64Array;
}

/**
 * A recorded run, for browsers without WebAssembly: `fps` frames a second,
 * each frame [time, ...qpos (nq values), ...ctrl].
 */
export interface Replay {
  fps: number;
  nq: number;
  frames: number[][];
}

interface Push {
  body: number;
  force: [number, number, number];
  until: number;
}

export class SimRunner {
  readonly model: MjModel;
  readonly data: MjData;
  /** Seconds per physics step. */
  readonly timestep: number;
  controller: Controller | undefined;
  private nextControl = 0;
  private pushes: Push[] = [];
  private readonly mj: Mujoco;

  constructor(mj: Mujoco, xml: string) {
    this.mj = mj;
    this.model = mj.MjModel.from_xml_string(xml);
    this.data = new mj.MjData(this.model);
    this.timestep = this.model.opt.timestep;
    this.mj.mj_forward(this.model, this.data);
  }

  get state(): SimState {
    return {
      time: this.data.time,
      qpos: this.data.qpos as Float64Array,
      qvel: this.data.qvel as Float64Array,
      ctrl: this.data.ctrl as Float64Array,
    };
  }

  /** Back to the start, optionally with joint positions set (e.g. a tilt). */
  reset(qpos: number[] = []): void {
    this.mj.mj_resetData(this.model, this.data);
    const q = this.data.qpos as Float64Array;
    qpos.forEach((v, i) => (q[i] = v));
    this.mj.mj_forward(this.model, this.data);
    this.nextControl = 0;
    this.pushes = [];
    (this.data.xfrc_applied as Float64Array).fill(0);
    this.controller?.reset();
  }

  /** A force (newtons, world frame) on a named body for `duration` seconds. */
  push(
    bodyName: string,
    force: [number, number, number],
    duration: number,
  ): void {
    const body = this.mj.mj_name2id(
      this.model,
      this.mj.mjtObj.mjOBJ_BODY.value,
      bodyName,
    );
    if (body < 0) throw new Error(`no body named ${bodyName}`);
    this.pushes.push({ body, force, until: this.data.time + duration });
  }

  /** Runs one physics step, calling the controller when its turn comes. */
  step(): void {
    const t = this.data.time;
    const ctrl = this.data.ctrl as Float64Array;
    if (this.controller && t >= this.nextControl - 1e-9) {
      const dt = 1 / this.controller.rate;
      const out = this.controller.control(this.state, dt);
      out.forEach((v, i) => (ctrl[i] = v));
      this.nextControl = t + dt;
    }
    const xfrc = this.data.xfrc_applied as Float64Array;
    xfrc.fill(0);
    this.pushes = this.pushes.filter((p) => p.until > t);
    for (const p of this.pushes) {
      for (let k = 0; k < 3; k++) xfrc[p.body * 6 + k] = p.force[k] ?? 0;
    }
    this.mj.mj_step(this.model, this.data);
  }

  /** Advances simulated time by `seconds` (whole physics steps). */
  advance(seconds: number): void {
    const n = Math.round(seconds / this.timestep);
    for (let i = 0; i < n; i++) this.step();
  }

  /** Frees the engine's memory (MuJoCo objects are not garbage-collected). */
  dispose(): void {
    this.data.delete();
    this.model.delete();
  }
}
