// <cartpole-demo>: balance a pole on a cart with PID (M5 Classical control).
// Chosen by the user, 2026-11-14: 3D with Three.js; scene, plot and controls
// stacked in one frame; presets that show the classic behaviours.
//
// The physics, loading and fallbacks are <mujoco-scene>'s; this element adds
// the flat drawing, the controller, the plot and the controls, in the page's
// language. Without JavaScript, the Markdown's own text inside the element
// shows instead.
import { isLang, t, type Lang } from "../../lib/i18n";
import type { MessageKey } from "../../i18n/en";
import modelXml from "../../../content/models/cartpole.xml?raw";
import {
  CARTPOLE,
  GAIN_RANGES,
  PRESETS,
  cartpoleController,
  isFallen,
  tilt,
} from "../models/cartpole";
import type { PidGains } from "../models/pid";
import type uPlot from "uplot";
import type {
  FlatView,
  FrameDetail,
  MujocoScene,
} from "../../sim/mujoco-scene";
import "../../sim/mujoco-scene";
import "uplot/dist/uPlot.min.css";
import "../demo.css";

const SVG = "http://www.w3.org/2000/svg";
/** Seconds of history in the plot. */
const WINDOW = 10;
const POLE = 0.8;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

function svg(tag: string, attrs: Record<string, string | number> = {}) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/** The side view: rail, cart and pole in ink, the pole in the data colour. */
function flatView(): FlatView {
  // Metres, y pointing down (y = −z); 16:9 like the 3D view.
  const root = svg("svg", {
    viewBox: "-1.8 -1.2 3.6 2.025",
    class: "sim-flat",
  }) as SVGSVGElement;
  root.append(
    svg("line", { x1: -1.62, y1: 0.07, x2: 1.62, y2: 0.07, class: "thick" }),
    svg("line", { x1: -1.62, y1: 0.0, x2: -1.62, y2: 0.1, class: "thick" }),
    svg("line", { x1: 1.62, y1: 0.0, x2: 1.62, y2: 0.1, class: "thick" }),
    svg("line", { x1: 0, y1: 0.1, x2: 0, y2: 0.16, class: "thin" }),
  );
  const cart = svg("rect", {
    x: -0.18,
    y: -0.05,
    width: 0.36,
    height: 0.1,
    class: "cart",
  });
  const pole = svg("line", { class: "pole" });
  const tip = svg("circle", { r: 0.045, class: "tip" });
  const hinge = svg("circle", { r: 0.018, class: "hinge" });
  root.append(cart, pole, tip, hinge);
  return {
    element: root,
    draw(qpos) {
      const x = qpos[0] ?? 0;
      const a = qpos[1] ?? 0;
      const hy = -0.05;
      const tx = x + POLE * Math.sin(a);
      const ty = hy - POLE * Math.cos(a);
      cart.setAttribute("x", String(x - 0.18));
      for (const [k, v] of [
        ["x1", x],
        ["y1", hy],
        ["x2", tx],
        ["y2", ty],
      ] as const)
        pole.setAttribute(k, String(v));
      tip.setAttribute("cx", String(tx));
      tip.setAttribute("cy", String(ty));
      hinge.setAttribute("cx", String(x));
      hinge.setAttribute("cy", String(hy));
    },
  };
}

class CartpoleDemo extends HTMLElement {
  private pageLang: Lang = "en";
  private scene!: MujocoScene;
  private controller = cartpoleController(
    PRESETS[0]?.gains ?? { kp: 30, ki: 0, kd: 6 },
  );
  private sliders = new Map<keyof PidGains, HTMLInputElement>();
  private outputs = new Map<keyof PidGains, HTMLOutputElement>();
  private presetButtons: HTMLButtonElement[] = [];
  private buttons: Record<
    "play" | "step" | "reset" | "push",
    HTMLButtonElement
  > = {} as never;
  private readouts: Record<"angle" | "force" | "time", HTMLElement> =
    {} as never;
  private status!: HTMLElement;
  private note!: HTMLElement;
  private start!: HTMLElement;
  private plotHost!: HTMLElement;
  private plot: uPlot | undefined;
  private series: number[][] = [[], [], []];
  private lastPlot = 0;
  private fallen: boolean | undefined;
  private built = false;
  private cleanup: (() => void)[] = [];

  private t(key: MessageKey): string {
    return t(this.pageLang, key);
  }

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = this.closest("[lang]")?.getAttribute("lang");
    this.pageLang = isLang(lang) ? lang : "en";
    this.replaceChildren(this.build());
  }

  disconnectedCallback(): void {
    for (const f of this.cleanup) f();
    this.cleanup = [];
    this.plot?.destroy();
    this.plot = undefined;
    this.built = false;
  }

  private build(): HTMLElement {
    const titleId = `cartpole-${Math.random().toString(36).slice(2, 8)}`;
    const frame = el("figure", {
      class: "sim-demo",
      role: "group",
      "aria-labelledby": titleId,
    });
    frame.append(
      el(
        "div",
        { class: "sim-head" },
        el("span", { class: "label" }, this.t("demo.sim")),
        el("strong", { id: titleId }, this.t("demo.cartpole.title")),
      ),
    );

    // The scene, with the Run button over the poster.
    this.scene = document.createElement("mujoco-scene") as MujocoScene;
    this.scene.className = "sim-scene";
    this.scene.config = {
      xml: modelXml,
      roles: {
        floor: "floor",
        rail: "muted",
        "stop-left": "muted",
        "stop-right": "muted",
        pole: "accent",
        tip: "accent",
      },
      camera: { position: [0.7, -3.3, 1.1], target: [0, 0, 0.3], fov: 36 },
      initial: [0, CARTPOLE.startTilt],
      controller: this.controller,
      flat: flatView(),
      replayUrl: `${import.meta.env.BASE_URL}sim/cartpole-replay.json`,
      labels: { view3d: this.t("demo.view3d"), flat: this.t("demo.flat") },
    };
    const runButton = el(
      "button",
      { type: "button", class: "btn primary" },
      `▶ ${this.t("demo.run")}`,
    );
    const runNote = el("p", { class: "muted" }, this.t("demo.runNote"));
    this.start = el("div", { class: "sim-start" }, runButton, runNote);
    runButton.addEventListener("click", () => void this.scene.start());
    this.scene.append(this.start);
    frame.append(this.scene);
    this.scene.showPoster();

    // The plot, with a legend in words.
    const legend = el(
      "p",
      { class: "sim-legend" },
      el("span", { class: "key angle", "aria-hidden": "true" }),
      `${this.t("demo.angle")} (${this.t("demo.unit.deg")})`,
      el("span", { class: "key force", "aria-hidden": "true" }),
      `${this.t("demo.force")} (${this.t("demo.unit.n")})`,
    );
    this.plotHost = el("div", {
      class: "sim-plot",
      role: "img",
      "aria-label": this.t("demo.plot"),
    });
    frame.append(el("div", { class: "sim-plot-wrap" }, legend, this.plotHost));

    frame.append(this.buildControls());

    // Readouts and status in words.
    const readouts = el("dl", { class: "sim-readouts" });
    for (const key of ["angle", "force", "time"] as const) {
      const dd = el("dd", {}, "–");
      readouts.append(el("div", {}, el("dt", {}, this.t(`demo.${key}`)), dd));
      this.readouts[key] = dd;
    }
    this.status = el(
      "dd",
      { "aria-live": "polite" },
      this.t("demo.status.idle"),
    );
    readouts.append(
      el("div", {}, el("dt", {}, this.t("demo.status")), this.status),
    );
    frame.append(readouts);
    this.note = el("p", { class: "sim-note muted", "aria-live": "polite" });
    frame.append(this.note);

    this.listen();
    this.setEnabled(false);
    return frame;
  }

  private buildControls(): HTMLElement {
    const controls = el("div", {
      class: "sim-controls",
      role: "group",
      "aria-label": this.t("demo.controls"),
    });

    const presets = el("div", {
      class: "sim-presets",
      role: "group",
      "aria-label": this.t("demo.presets"),
    });
    presets.append(
      el("span", { class: "muted" }, `${this.t("demo.presets")}:`),
    );
    for (const preset of PRESETS) {
      const b = el(
        "button",
        {
          type: "button",
          class: "btn small",
          "aria-pressed": "false",
          "data-preset": preset.id,
        },
        this.t(`demo.preset.${preset.id}`),
      );
      b.addEventListener("click", () => {
        this.setGains(preset.gains);
        if (this.scene.ready) {
          this.scene.reset();
          this.scene.play();
        }
      });
      presets.append(b);
      this.presetButtons.push(b);
    }
    controls.append(presets);

    const gains = el("fieldset", { class: "sim-gains" });
    gains.append(el("legend", {}, this.t("demo.gains")));
    for (const key of ["kp", "ki", "kd"] as const) {
      const id = `${key}-${Math.random().toString(36).slice(2, 8)}`;
      const input = el("input", {
        id,
        type: "range",
        min: "0",
        max: String(GAIN_RANGES[key].max),
        step: String(GAIN_RANGES[key].step),
        value: String(this.controller.pid.gains[key]),
      });
      const output = el("output", { for: id });
      input.addEventListener("input", () => {
        this.controller.pid.gains[key] = Number(input.value);
        this.syncGains();
      });
      gains.append(
        el(
          "div",
          { class: "sim-gain" },
          el("label", { for: id }, this.t(`demo.${key}`)),
          input,
          output,
        ),
      );
      this.sliders.set(key, input);
      this.outputs.set(key, output);
    }
    controls.append(gains);

    const bar = el("div", { class: "sim-buttons" });
    const make = (key: "play" | "step" | "reset" | "push", label: string) => {
      const b = el("button", { type: "button", class: "btn small" }, label);
      this.buttons[key] = b;
      bar.append(b);
      return b;
    };
    make("play", this.t("demo.play")).addEventListener("click", () =>
      this.scene.playing ? this.scene.pause() : this.scene.play(),
    );
    make("step", this.t("demo.step")).addEventListener("click", () =>
      this.scene.stepOnce(),
    );
    make("reset", this.t("demo.reset")).addEventListener("click", () =>
      this.scene.reset(),
    );
    make("push", `${this.t("demo.push")} →`).addEventListener("click", () => {
      this.scene.sim?.push(
        "pole",
        [CARTPOLE.push.force, 0, 0],
        CARTPOLE.push.duration,
      );
      if (!this.scene.playing) this.scene.play();
    });
    controls.append(bar);
    this.syncGains();
    return controls;
  }

  private setGains(gains: PidGains): void {
    Object.assign(this.controller.pid.gains, gains);
    for (const [key, input] of this.sliders) input.value = String(gains[key]);
    this.syncGains();
  }

  /** Slider readouts, and which preset (if any) matches the gains. */
  private syncGains(): void {
    const g = this.controller.pid.gains;
    for (const [key, output] of this.outputs) output.value = String(g[key]);
    for (const b of this.presetButtons) {
      const p = PRESETS.find((x) => x.id === b.dataset["preset"]);
      const on =
        p !== undefined &&
        p.gains.kp === g.kp &&
        p.gains.ki === g.ki &&
        p.gains.kd === g.kd;
      b.setAttribute("aria-pressed", String(on));
    }
  }

  private setEnabled(ready: boolean, replay = false): void {
    this.buttons.play.disabled = !ready;
    this.buttons.step.disabled = !ready;
    this.buttons.reset.disabled = !ready;
    this.buttons.push.disabled = !ready || replay;
    for (const s of this.sliders.values()) s.disabled = replay;
    for (const b of this.presetButtons) b.disabled = replay;
  }

  private listen(): void {
    const on = (type: string, f: (e: CustomEvent) => void) => {
      const handler = (e: Event) => f(e as CustomEvent);
      this.scene.addEventListener(type, handler);
      this.cleanup.push(() => this.scene.removeEventListener(type, handler));
    };
    on("sim-mode", (e) => void this.onMode(e.detail as string));
    on("sim-play", (e) => {
      const playing = e.detail as boolean;
      this.buttons.play.textContent = this.t(
        playing ? "demo.pause" : "demo.play",
      );
    });
    on("sim-reset", () => {
      this.series = [[], [], []];
      this.plot?.setData(this.data());
    });
    on("sim-frame", (e) => this.onFrame(e.detail as FrameDetail));
    const theme = new MutationObserver(() => void this.makePlot());
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const resize = new ResizeObserver(() =>
      this.plot?.setSize(this.plotSize()),
    );
    resize.observe(this.plotHost);
    this.cleanup.push(
      () => theme.disconnect(),
      () => resize.disconnect(),
    );
  }

  private async onMode(mode: string): Promise<void> {
    const runButton = this.start.querySelector("button");
    const note = this.start.querySelector("p");
    if (mode === "loading" && runButton && note) {
      runButton.disabled = true;
      note.textContent = this.t("demo.loading");
    } else if (mode === "error" && runButton && note) {
      runButton.disabled = false;
      runButton.textContent = `↻ ${this.t("demo.retry")}`;
      note.textContent = this.t("demo.error");
    } else if (mode === "3d" || mode === "flat" || mode === "replay") {
      this.start.hidden = true;
      this.note.textContent = this.t(`demo.mode.${mode}`);
      this.setEnabled(true, mode === "replay");
      await this.makePlot();
    }
  }

  private onFrame(f: FrameDetail): void {
    const angle = tilt(f.qpos as Float64Array) * (180 / Math.PI);
    const force = f.ctrl[0] ?? 0;
    const [ts = [], as = [], fs = []] = this.series;
    // A step back in time means the run started again.
    if (ts.length && f.time < (ts.at(-1) ?? 0)) {
      ts.length = as.length = fs.length = 0;
    }
    ts.push(f.time);
    as.push(angle);
    fs.push(force);
    while (ts.length && (ts[0] ?? 0) < f.time - WINDOW) {
      ts.shift();
      as.shift();
      fs.shift();
    }
    const now = performance.now();
    if (now - this.lastPlot > 66 || !this.scene.playing) {
      this.lastPlot = now;
      this.plot?.setData(this.data());
      const n = (v: number, d: number) =>
        v.toLocaleString(this.pageLang, {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        });
      this.readouts.angle.textContent = `${n(angle, 1)}${this.t("demo.unit.deg")}`;
      this.readouts.force.textContent = `${n(force, 1)}\u00a0${this.t("demo.unit.n")}`;
      this.readouts.time.textContent = `${n(f.time, 2)}\u00a0${this.t("demo.unit.s")}`;
    }
    const fallen = isFallen(f.qpos as Float64Array);
    if (fallen !== this.fallen) {
      this.fallen = fallen;
      this.status.textContent = this.t(
        fallen ? "demo.status.fallen" : "demo.status.upright",
      );
    }
  }

  private data(): uPlot.AlignedData {
    return this.series as unknown as uPlot.AlignedData;
  }

  private plotSize() {
    return { width: Math.max(200, this.plotHost.clientWidth), height: 150 };
  }

  /** (Re)creates the plot in the theme's colours. */
  private async makePlot(): Promise<void> {
    if (!this.scene.ready) return;
    const { default: uPlot } = await import("uplot");
    const css = getComputedStyle(this);
    const v = (name: string) => css.getPropertyValue(name).trim();
    const axis = {
      stroke: v("--muted"),
      grid: { stroke: v("--rule"), width: 1 },
      ticks: { stroke: v("--rule"), width: 1 },
      font: `11px ${v("--mono") || "monospace"}`,
    };
    this.plot?.destroy();
    this.plot = new uPlot(
      {
        ...this.plotSize(),
        legend: { show: false },
        cursor: { show: false },
        scales: {
          x: { time: false },
          deg: {
            range: (_u, min, max) => [Math.min(min, -10), Math.max(max, 10)],
          },
          n: { range: [-CARTPOLE.forceLimit, CARTPOLE.forceLimit] },
        },
        axes: [
          { ...axis, values: (_u, ticks) => ticks.map((x) => `${x}`) },
          { ...axis, scale: "deg" },
          { ...axis, scale: "n", side: 1, grid: { show: false } },
        ],
        series: [
          {},
          { scale: "deg", stroke: v("--d") || v("--line"), width: 2 },
          { scale: "n", stroke: v("--line"), width: 1.5, dash: [6, 4] },
        ],
      },
      this.data(),
      this.plotHost,
    );
  }
}

if (!customElements.get("cartpole-demo"))
  customElements.define("cartpole-demo", CartpoleDemo);
