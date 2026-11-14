// <euler-demo>: Euler's method against the exact curve (F2 Calculus and
// differential equations). A motor spins up towards 10 rad/s with time
// constant τ = 0.3 s; the slider sets Euler's step h. Small steps follow the
// curve, h = τ lands on the target in one step, τ < h < 2τ overshoots, and
// h ≥ 2τ never settles. The maths is src/demos/models/euler.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import {
  SPIN_UP,
  behaviour,
  eulerSteps,
  exact,
  maxError,
} from "../models/euler";
import "../demo.css";

/** The plot in SVG units: time 0–2 s across, speed −5…25 rad/s up. */
const P = { left: 64, right: 624, top: 16, bottom: 300, vMin: -5, vMax: 25 };
const X = (t: number) => P.left + (t / SPIN_UP.duration) * (P.right - P.left);
const Y = (v: number) =>
  P.bottom - ((v - P.vMin) / (P.vMax - P.vMin)) * (P.bottom - P.top);

const PRESETS = [
  { key: "demo.euler.preset.small", h: 0.05 },
  { key: "demo.euler.preset.tau", h: 0.3 },
  { key: "demo.euler.preset.big", h: 0.7 },
] as const;

class EulerDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const s = tr("demo.unit.s");
    let h = 0.2;

    const plot = svg("svg", {
      viewBox: "0 0 640 350",
      class: "demo-svg demo-plot",
      role: "img",
      "aria-label": tr("demo.euler.view"),
    });
    const clipId = `euler-clip-${Math.random().toString(36).slice(2, 8)}`;
    const clip = svg("clipPath", { id: clipId });
    clip.append(
      svg("rect", {
        x: P.left,
        y: P.top,
        width: P.right - P.left,
        height: P.bottom - P.top,
      }),
    );
    plot.append(clip);
    for (const t of [0, 0.5, 1, 1.5, 2]) {
      plot.append(
        svg("line", {
          x1: X(t),
          y1: P.top,
          x2: X(t),
          y2: P.bottom,
          class: "grid",
        }),
        text(X(t), P.bottom + 20, num(lang, t, 1), "tick-px middle"),
      );
    }
    for (const v of [-5, 0, 5, 10, 15, 20, 25]) {
      plot.append(
        svg("line", {
          x1: P.left,
          y1: Y(v),
          x2: P.right,
          y2: Y(v),
          class: "grid",
        }),
        text(P.left - 8, Y(v) + 4, String(v), "tick-px end"),
      );
    }
    plot.append(
      svg("line", {
        x1: P.left,
        y1: Y(0),
        x2: P.right,
        y2: Y(0),
        class: "axis-px",
      }),
      text(
        (P.left + P.right) / 2,
        P.bottom + 42,
        tr("demo.euler.axisT"),
        "label-px middle",
      ),
    );
    const vLabel = text(
      P.left + 6,
      P.top + 14,
      tr("demo.euler.axisV"),
      "label-px",
    );
    plot.append(vLabel);
    // The final speed, the exact curve, then Euler's steps on top.
    plot.append(
      svg("line", {
        x1: P.left,
        y1: Y(SPIN_UP.target),
        x2: P.right,
        y2: Y(SPIN_UP.target),
        class: "target",
      }),
    );
    const curve = [];
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * SPIN_UP.duration;
      curve.push(`${X(t)},${Y(exact(t))}`);
    }
    plot.append(svg("polyline", { points: curve.join(" "), class: "exact" }));
    const steps = svg("g", { "clip-path": `url(#${clipId})` });
    plot.append(steps);

    const out = {
      steps: el("dd"),
      error: el("dd"),
      behaviour: el("dd", { "aria-live": "polite" }),
    };
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      el("div", {}, el("dt", {}, tr("demo.euler.steps")), out.steps),
      el("div", {}, el("dt", {}, tr("demo.euler.error")), out.error),
      el("div", {}, el("dt", {}, tr("demo.euler.behaviour")), out.behaviour),
    );

    const draw = () => {
      const pts = eulerSteps(h);
      const line = svg("polyline", {
        points: pts.map((p) => `${X(p.t)},${Y(p.v)}`).join(" "),
        class: "euler",
      });
      const dots =
        pts.length <= 60
          ? pts.map((p) =>
              svg("circle", { cx: X(p.t), cy: Y(p.v), r: 4.5, class: "point" }),
            )
          : [];
      steps.replaceChildren(line, ...dots);
      out.steps.textContent = String(pts.length - 1);
      out.error.textContent = `${num(lang, maxError(h), 2)}\u00a0${tr("demo.unit.rads")}`;
      out.behaviour.textContent = tr(`demo.euler.${behaviour(h)}`);
      for (const b of presetButtons)
        b.setAttribute("aria-pressed", String(Number(b.dataset["h"]) === h));
    };

    const step = slider({
      label: tr("demo.euler.step"),
      min: 0.02,
      max: 0.8,
      step: 0.01,
      value: h,
      format: (v) => `${num(lang, v, 2)}\u00a0${s}`,
      onInput: (v) => {
        h = v;
        draw();
      },
    });
    const presetButtons = PRESETS.map((p) => {
      const b = el(
        "button",
        {
          type: "button",
          class: "btn small",
          "aria-pressed": "false",
          "data-h": String(p.h),
        },
        tr(p.key),
      );
      b.addEventListener("click", () => {
        h = p.h;
        step.set(h);
        draw();
      });
      return b;
    });
    const presets = el(
      "div",
      { class: "sim-presets", role: "group", "aria-label": tr("demo.presets") },
      el("span", { class: "muted" }, `${tr("demo.presets")}:`),
      ...presetButtons,
    );
    draw();

    this.replaceChildren(
      el(
        "figure",
        {
          class: "sim-demo demo-2d",
          role: "group",
          "aria-label": tr("demo.euler.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.euler.title")),
        ),
        el("div", { class: "demo-view demo-view-plot" }, plot),
        el("p", { class: "demo-legend muted" }, tr("demo.euler.legend")),
        el(
          "div",
          { class: "demo-controls demo-controls-one" },
          presets,
          step.row,
        ),
        readouts,
      ),
    );
  }
}

function text(x: number, y: number, content: string, cls: string): SVGElement {
  const t = svg("text", { x, y, class: cls });
  t.textContent = content;
  return t;
}

if (!customElements.get("euler-demo"))
  customElements.define("euler-demo", EulerDemo);
