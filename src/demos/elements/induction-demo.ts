// <induction-demo>: a magnet through a coil (F6 Electromagnetism). The
// magnet swings in and out along the coil's axis; the trace below is the
// voltage Faraday's law gives. Speed and turns are sliders; Play / Pause
// runs it, starting paused under reduced motion and pausing off-screen. The
// physics is src/demos/models/induction.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import { emf, motion, peakEmf } from "../models/induction";
import "../demo.css";

const WINDOW = 4; // seconds of trace
const CX = 330; // the coil's centre in the scene, px
const PX = 2400; // px per metre of magnet travel
const PLOT = { left: 56, right: 624, top: 14, bottom: 166 };

class InductionDemo extends HTMLElement {
  private raf = 0;
  private cleanup: (() => void)[] = [];

  disconnectedCallback(): void {
    cancelAnimationFrame(this.raf);
    for (const f of this.cleanup) f();
    this.cleanup = [];
  }

  connectedCallback(): void {
    if (this.childElementCount && this.querySelector(".sim-demo")) return;
    const lang = pageLang(this);
    const tr = translator(lang);
    const V = tr("demo.unit.v");
    let f = 1;
    let turns = 200;
    let t = 0;
    let playing = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    let visible = true;
    const trace: [number, number][] = [];

    // The scene: the coil's loops, the axis, and the magnet.
    const scene = svg("svg", {
      viewBox: "0 0 660 200",
      class: "demo-svg demo-plot",
      role: "img",
      "aria-label": tr("demo.induction.view"),
    });
    scene.append(
      svg("line", { x1: 20, y1: 100, x2: 640, y2: 100, class: "plumb" }),
    );
    const back = svg("g");
    const front = svg("g");
    const loops = svg("g");
    const magnet = svg("g", { class: "magnet" });
    magnet.append(
      svg("rect", { x: -60, y: -14, width: 60, height: 28, class: "pole-n" }),
      svg("rect", { x: 0, y: -14, width: 60, height: 28, class: "pole-s" }),
      Object.assign(
        svg("text", { x: -30, y: -22, class: "label-px middle pole" }),
        { textContent: "N" },
      ),
      Object.assign(
        svg("text", { x: 30, y: -22, class: "label-px middle pole" }),
        { textContent: "S" },
      ),
    );
    scene.append(back, magnet, front, loops);
    scene.append(
      svg("path", {
        d: `M${CX - 80},150 C${CX - 80},178 ${CX - 30},180 ${CX - 30},192`,
        class: "lead",
      }),
      svg("path", {
        d: `M${CX + 80},150 C${CX + 80},178 ${CX + 30},180 ${CX + 30},192`,
        class: "lead",
      }),
    );
    const drawCoil = () => {
      const n = Math.max(4, Math.min(16, Math.round(turns / 25)));
      const halves: SVGElement[] = [];
      const fronts: SVGElement[] = [];
      for (let i = 0; i < n; i++) {
        const x = CX - 80 + (160 * (i + 0.5)) / n;
        halves.push(
          svg("path", {
            d: `M${x},50 A12,50 0 0 0 ${x},150`,
            class: "coil-back",
          }),
        );
        fronts.push(
          svg("path", { d: `M${x},50 A12,50 0 0 1 ${x},150`, class: "coil" }),
        );
      }
      back.replaceChildren(...halves);
      front.replaceChildren(...fronts);
    };

    // The trace.
    const plot = svg("svg", {
      viewBox: "0 0 660 190",
      class: "demo-svg demo-plot",
      role: "img",
      "aria-label": tr("demo.induction.plot"),
    });
    const zero = (PLOT.top + PLOT.bottom) / 2;
    plot.append(
      svg("line", {
        x1: PLOT.left,
        y1: zero,
        x2: PLOT.right,
        y2: zero,
        class: "axis-px",
      }),
      svg("line", {
        x1: PLOT.left,
        y1: PLOT.top,
        x2: PLOT.left,
        y2: PLOT.bottom,
        class: "grid",
      }),
    );
    const topLabel = svg("text", {
      x: PLOT.left - 8,
      y: PLOT.top + 10,
      class: "tick-px end",
    });
    const bottomLabel = svg("text", {
      x: PLOT.left - 8,
      y: PLOT.bottom,
      class: "tick-px end",
    });
    const zeroLabel = svg("text", {
      x: PLOT.left - 8,
      y: zero + 4,
      class: "tick-px end",
    });
    zeroLabel.textContent = "0";
    const line = svg("polyline", { class: "euler" });
    plot.append(topLabel, bottomLabel, zeroLabel, line);

    const out = {
      now: el("dd"),
      peak: el("dd"),
      state: el("dd", { "aria-live": "polite" }),
    };
    let lastState = "";
    const volts = (v: number) => `${num(lang, v, 3)} ${V}`;

    const draw = () => {
      const { x, v } = motion(t, f);
      const e = playing ? emf(turns, x, v) : 0;
      magnet.setAttribute("transform", `translate(${CX + x * PX} 100)`);
      const peak = peakEmf(turns, f);
      const span = peak * 1.15 || 1;
      topLabel.textContent = num(lang, span, 2);
      bottomLabel.textContent = num(lang, -span, 2);
      const Y = (val: number) => zero - (val / span) * (zero - PLOT.top);
      const X = (time: number) =>
        PLOT.right - ((t - time) / WINDOW) * (PLOT.right - PLOT.left);
      line.setAttribute(
        "points",
        trace.map(([time, val]) => `${X(time)},${Y(val)}`).join(" "),
      );
      out.now.textContent = volts(e);
      out.peak.textContent = volts(peak);
      // Moving in: getting closer to the centre.
      const state = !playing ? "still" : x * v < 0 ? "in" : "out";
      if (state !== lastState) {
        lastState = state;
        out.state.textContent = tr(`demo.induction.${state}`);
      }
    };

    let last = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      const { x, v } = motion(t, f);
      trace.push([t, emf(turns, x, v)]);
      while (trace.length && (trace[0]?.[0] ?? 0) < t - WINDOW) trace.shift();
      draw();
      this.raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(this.raf);
      if (playing && visible) {
        last = performance.now();
        this.raf = requestAnimationFrame(tick);
      }
      playButton.textContent = tr(playing ? "demo.pause" : "demo.play");
      draw();
    };

    const playButton = el("button", { type: "button", class: "btn small" });
    playButton.addEventListener("click", () => {
      playing = !playing;
      sync();
    });
    const speed = slider({
      label: tr("demo.induction.speed"),
      min: 0.25,
      max: 3,
      step: 0.25,
      value: f,
      format: (v) => num(lang, v, 2),
      onInput: (v) => {
        f = v;
        draw();
      },
    });
    const turnSlider = slider({
      label: tr("demo.induction.turns"),
      min: 20,
      max: 400,
      step: 20,
      value: turns,
      format: (v) => String(v),
      onInput: (v) => {
        turns = v;
        trace.length = 0;
        drawCoil();
        draw();
      },
    });
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.induction.now", out.now],
          ["demo.induction.peak", out.peak],
          ["demo.induction.state", out.state],
        ] as const
      ).map(([k, dd]) => el("div", {}, el("dt", {}, tr(k)), dd)),
    );

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      sync();
    });
    io.observe(this);
    this.cleanup.push(() => io.disconnect());

    drawCoil();
    this.replaceChildren(
      el(
        "figure",
        {
          class: "sim-demo demo-2d",
          role: "group",
          "aria-label": tr("demo.induction.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.induction.title")),
        ),
        el("div", { class: "demo-view demo-view-scene" }, scene),
        el("div", { class: "demo-view demo-view-trace" }, plot),
        el("p", { class: "demo-legend muted" }, tr("demo.induction.legend")),
        el(
          "div",
          { class: "demo-controls demo-controls-one" },
          el("div", { class: "sim-buttons" }, playButton),
          speed.row,
          turnSlider.row,
        ),
        readouts,
      ),
    );
    sync();
  }
}

if (!customElements.get("induction-demo"))
  customElements.define("induction-demo", InductionDemo);
