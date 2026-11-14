// <mujoco-scene>: the one element every MuJoCo demo uses (docs/PLAN.md "How
// MuJoCo demos load"). A demo gives it a config (model, controller, a flat
// drawing, its replay) and its own controls; the scene does the rest:
//
// - Nothing heavy loads until start() (the demo's Run button).
// - It picks the best it can do: the engine + Three.js in 3D; the engine
//   drawn flat when WebGL is missing; a replay recorded at build time when
//   WebAssembly is missing.
// - Real-time stepping, paused while off-screen; under reduced motion it
//   loads paused; it follows the light/dark theme; it frees the engine's
//   memory when removed.
//
// It reports through events: "sim-mode" (detail: SceneMode), "sim-play"
// (detail: boolean), "sim-frame" (detail: FrameDetail), "sim-reset".
import { hasWebAssembly, hasWebGL, loadMujoco } from "./load";
import { SimRunner, type Controller, type Replay } from "./runner";
import type { CameraSpec, GeomRole, Scene3D } from "./scene3d";

export interface FlatView {
  element: SVGSVGElement;
  draw(qpos: ArrayLike<number>): void;
}

export interface SceneConfig {
  xml: string;
  roles: Record<string, GeomRole>;
  camera: CameraSpec;
  /** Joint positions at the start (and after Reset). */
  initial: number[];
  controller: Controller;
  flat: FlatView;
  /** The recording for browsers without WebAssembly. */
  replayUrl: string;
  /** Labels for the drawing, in the page's language. */
  labels: { view3d: string; flat: string };
}

export type SceneMode = "idle" | "loading" | "3d" | "flat" | "replay" | "error";

export interface FrameDetail {
  time: number;
  qpos: ArrayLike<number>;
  ctrl: ArrayLike<number>;
}

/** Longest real time one animation frame may simulate (after a stall). */
const MAX_FRAME = 0.05;

export class MujocoScene extends HTMLElement {
  config: SceneConfig | undefined;
  sim: SimRunner | undefined;
  mode: SceneMode = "idle";
  playing = false;
  private view3d: Scene3D | undefined;
  private canvas: HTMLCanvasElement | undefined;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private visible = true;
  /** Whether the animation loop is running (playing, and on screen). */
  private running = false;
  private replay: Replay | undefined;
  private replayFrame = 0;
  private observers: { disconnect(): void }[] = [];

  /** Shows the flat drawing at the starting position (before Run). */
  showPoster(): void {
    const c = this.config;
    if (!c) return;
    c.flat.element.setAttribute("role", "img");
    c.flat.element.setAttribute("aria-label", c.labels.flat);
    if (!c.flat.element.isConnected) this.prepend(c.flat.element);
    c.flat.draw(c.initial);
  }

  connectedCallback(): void {
    // Off-screen, the loop stops; "playing" (the reader's choice) stays.
    const io = new IntersectionObserver(([entry]) => {
      this.visible = entry?.isIntersecting ?? true;
      this.syncLoop();
    });
    io.observe(this);
    const theme = new MutationObserver(() => this.view3d?.applyTheme());
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    this.observers.push(io, theme);
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.raf);
    for (const o of this.observers) o.disconnect();
    this.observers = [];
    this.view3d?.dispose();
    this.view3d = undefined;
    this.sim?.dispose();
    this.sim = undefined;
  }

  /** Loads what this browser can run, then plays (paused under reduced motion). */
  async start(): Promise<void> {
    const c = this.config;
    if (!c || this.mode === "loading") return;
    this.setMode("loading");
    try {
      if (!hasWebAssembly()) {
        const res = await fetch(c.replayUrl);
        if (!res.ok) throw new Error(`replay: ${res.status}`);
        this.replay = (await res.json()) as Replay;
        this.replayFrame = 0;
        this.setMode("replay");
      } else {
        const mj = await loadMujoco();
        this.sim = new SimRunner(mj, c.xml);
        this.sim.controller = c.controller;
        this.sim.reset(c.initial);
        if (hasWebGL()) {
          try {
            const { Scene3D } = await import("./scene3d");
            this.canvas = document.createElement("canvas");
            this.canvas.setAttribute("role", "img");
            this.canvas.setAttribute("aria-label", c.labels.view3d);
            this.view3d = new Scene3D(
              this.canvas,
              this,
              mj,
              this.sim.model,
              c.roles,
              c.camera,
            );
            c.flat.element.replaceWith(this.canvas);
            this.setMode("3d");
          } catch {
            this.view3d = undefined; // WebGL failed after all: draw flat
            this.setMode("flat");
          }
        } else {
          this.setMode("flat");
        }
      }
    } catch (error) {
      console.error(error);
      this.setMode("error");
      return;
    }
    this.draw();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduced) this.play();
  }

  play(): void {
    if (this.playing || !this.ready) return;
    this.playing = true;
    this.syncLoop();
    this.emit("sim-play", true);
  }

  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    this.syncLoop();
    this.emit("sim-play", false);
    this.draw(); // so readouts show exactly where it stopped
  }

  /** Runs the loop only while playing and on screen. */
  private syncLoop(): void {
    const run = this.playing && this.visible;
    if (run === this.running) return;
    this.running = run;
    if (run) {
      this.last = performance.now();
      this.acc = 0;
      this.raf = requestAnimationFrame((t) => this.tick(t));
    } else {
      cancelAnimationFrame(this.raf);
    }
  }

  /** Moves on by `seconds` while paused (a replay moves by one frame). */
  stepOnce(seconds = 0.02): void {
    if (!this.ready) return;
    this.pause();
    if (this.replay)
      this.replayFrame = Math.min(
        this.replayFrame + 1,
        this.replay.frames.length - 1,
      );
    else this.sim?.advance(seconds);
    this.draw();
  }

  reset(): void {
    if (!this.ready || !this.config) return;
    if (this.replay) this.replayFrame = 0;
    else this.sim?.reset(this.config.initial);
    this.emit("sim-reset", null);
    this.draw();
  }

  get ready(): boolean {
    return this.mode === "3d" || this.mode === "flat" || this.mode === "replay";
  }

  private tick(now: number): void {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, MAX_FRAME);
    this.last = now;
    if (this.replay) {
      this.acc += dt;
      const step = 1 / this.replay.fps;
      while (this.acc >= step) {
        this.acc -= step;
        this.replayFrame++;
        if (this.replayFrame >= this.replay.frames.length) {
          this.replayFrame = 0; // the recording loops
          this.emit("sim-reset", null);
        }
      }
    } else if (this.sim) {
      this.acc += dt;
      const n = Math.floor(this.acc / this.sim.timestep);
      for (let i = 0; i < n; i++) this.sim.step();
      this.acc -= n * this.sim.timestep;
    }
    this.draw();
    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  /** Draws the current state and reports it. */
  private draw(): void {
    const c = this.config;
    if (!c) return;
    let frame: FrameDetail;
    if (this.replay) {
      const f = this.replay.frames[this.replayFrame] ?? [0];
      const nq = this.replay.nq;
      frame = {
        time: f[0] ?? 0,
        qpos: f.slice(1, 1 + nq),
        ctrl: f.slice(1 + nq),
      };
    } else if (this.sim) {
      frame = {
        time: this.sim.data.time,
        qpos: this.sim.data.qpos as Float64Array,
        ctrl: this.sim.data.ctrl as Float64Array,
      };
    } else return;
    if (this.view3d && this.sim) {
      this.view3d.update(this.sim.data);
      this.view3d.render();
    } else {
      c.flat.draw(frame.qpos);
    }
    this.emit("sim-frame", frame);
  }

  private setMode(mode: SceneMode): void {
    this.mode = mode;
    this.dataset["mode"] = mode;
    this.emit("sim-mode", mode);
  }

  private emit(type: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

if (!customElements.get("mujoco-scene"))
  customElements.define("mujoco-scene", MujocoScene);
