// <fit-demo>: gradient descent fitting a line (F4 Optimization). Twelve
// readings calibrate a distance sensor: find the line (slope a, offset b)
// that turns readings into true distances. Left, the data and the current
// line; right, the cost over (a, b) as exact ellipse contours and the path of
// the steps. The step size decides: roll down, zigzag, or diverge. The maths
// is src/demos/models/fit.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import {
  behaviour,
  calibrationData,
  contour,
  cost,
  descend,
  leastSquares,
  type Params,
} from "../models/fit";
import "../demo.css";

const START: Params = [0.2, 0.8];
const LEVELS = [0.005, 0.02, 0.06, 0.15, 0.35, 0.7];
/** Each panel is 320 × 280 SVG units with a plot area inside. */
const BOX = { left: 46, right: 308, top: 12, bottom: 236 };

function scale(lo: number, hi: number, a: number, b: number) {
  return (v: number) => a + ((v - lo) / (hi - lo)) * (b - a);
}

class FitDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const data = calibrationData();
    const best = leastSquares(data);
    let eta = 0.2;
    let path: Params[] = [START];

    // Left: the data. Readings 0–2.2 m across, true distances 0–2.2 m up.
    const DX = scale(0, 2.2, BOX.left, BOX.right);
    const DY = scale(0, 2.2, BOX.bottom, BOX.top);
    const left = panel(tr("demo.fit.data"));
    grid(left, [0, 0.5, 1, 1.5, 2], DX, DY, lang);
    axisLabels(left, tr("demo.fit.axisX"), tr("demo.fit.axisY"));
    const clipL = clip(left);
    const bestLine = svg("line", { class: "target", "clip-path": clipL });
    const guess = svg("line", { class: "euler", "clip-path": clipL });
    left.append(bestLine, guess);
    for (const d of data)
      left.append(
        svg("circle", { cx: DX(d.x), cy: DY(d.y), r: 4, class: "dot" }),
      );
    const lineAt = (l: SVGElement, p: Params) => {
      l.setAttribute("x1", String(DX(0)));
      l.setAttribute("y1", String(DY(p[1])));
      l.setAttribute("x2", String(DX(2.2)));
      l.setAttribute("y2", String(DY(p[0] * 2.2 + p[1])));
    };
    lineAt(bestLine, best);

    // Right: the cost valley. Slope a from −0.4 to 2.6, offset b from −1.2 to 1.2.
    const AX = scale(-0.4, 2.6, BOX.left, BOX.right);
    const BY = scale(-1.2, 1.2, BOX.bottom, BOX.top);
    const right = panel(tr("demo.fit.valley"));
    const clipR = clip(right);
    for (const a of [0, 1, 2]) {
      right.append(
        svg("line", {
          x1: AX(a),
          y1: BOX.top,
          x2: AX(a),
          y2: BOX.bottom,
          class: "grid",
        }),
        text(AX(a), BOX.bottom + 18, num(lang, a, 0), "tick-px middle"),
      );
    }
    for (const b of [-1, 0, 1]) {
      right.append(
        svg("line", {
          x1: BOX.left,
          y1: BY(b),
          x2: BOX.right,
          y2: BY(b),
          class: "grid",
        }),
        text(BOX.left - 6, BY(b) + 4, num(lang, b, 0), "tick-px end"),
      );
    }
    axisLabels(right, tr("demo.fit.axisA"), tr("demo.fit.axisB"));
    const jBest = cost(best, data);
    for (const c of LEVELS) {
      right.append(
        svg("polyline", {
          points: contour(data, c)
            .map(([a, b]) => `${AX(a)},${BY(b)}`)
            .join(" "),
          class: "contour",
          "clip-path": clipR,
        }),
      );
    }
    const x = 6;
    right.append(
      svg("line", {
        x1: AX(best[0]) - x,
        y1: BY(best[1]) - x,
        x2: AX(best[0]) + x,
        y2: BY(best[1]) + x,
        class: "cross",
      }),
      svg("line", {
        x1: AX(best[0]) - x,
        y1: BY(best[1]) + x,
        x2: AX(best[0]) + x,
        y2: BY(best[1]) - x,
        class: "cross",
      }),
    );
    const trail = svg("g", { "clip-path": clipR });
    right.append(trail);

    const out = {
      steps: el("dd"),
      line: el("dd"),
      cost: el("dd"),
      best: el("dd"),
      behaviour: el("dd", { "aria-live": "polite" }),
    };
    const pair = (p: Params) =>
      `a = ${num(lang, p[0], 3)}, b = ${num(lang, p[1], 3)}`;
    out.best.textContent = `${pair(best)} (${num(lang, jBest, 4)})`;

    const draw = () => {
      const p = path.at(-1) ?? START;
      lineAt(guess, p);
      trail.replaceChildren(
        svg("polyline", {
          points: path.map(([a, b]) => `${AX(a)},${BY(b)}`).join(" "),
          class: "euler",
        }),
        ...path
          .slice(-60)
          .map(([a, b]) =>
            svg("circle", { cx: AX(a), cy: BY(b), r: 3.5, class: "point" }),
          ),
      );
      const j = cost(p, data);
      out.steps.textContent = String(path.length - 1);
      out.line.textContent = Number.isFinite(j) && j < 1e6 ? pair(p) : "–";
      out.cost.textContent =
        Number.isFinite(j) && j < 1e6 ? num(lang, j, 4) : "> 1 000 000";
      out.behaviour.textContent = tr(`demo.fit.${behaviour(eta, data)}`);
      for (const b of presetButtons)
        b.setAttribute(
          "aria-pressed",
          String(Number(b.dataset["eta"]) === eta),
        );
    };

    const steps = (n: number) => {
      const from = path.at(-1) ?? START;
      path = [...path, ...descend(from, eta, n, data).slice(1)];
      draw();
    };
    const reset = () => {
      path = [START];
      draw();
    };
    const stepSize = slider({
      label: tr("demo.fit.eta"),
      min: 0.02,
      max: 0.5,
      step: 0.01,
      value: eta,
      format: (v) => num(lang, v, 2),
      onInput: (v) => {
        eta = v;
        reset();
      },
    });
    const presetButtons = (
      [
        ["demo.fit.preset.small", 0.05],
        ["demo.fit.preset.good", 0.2],
        ["demo.fit.preset.zigzag", 0.35],
        ["demo.fit.preset.big", 0.45],
      ] as const
    ).map(([key, value]) => {
      const b = el(
        "button",
        {
          type: "button",
          class: "btn small",
          "aria-pressed": "false",
          "data-eta": String(value),
        },
        tr(key),
      );
      b.addEventListener("click", () => {
        eta = value;
        stepSize.set(value);
        path = [START];
        steps(20);
      });
      return b;
    });
    const button = (label: string, f: () => void) => {
      const b = el("button", { type: "button", class: "btn small" }, label);
      b.addEventListener("click", f);
      return b;
    };
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.fit.steps", out.steps],
          ["demo.fit.line", out.line],
          ["demo.fit.cost", out.cost],
          ["demo.fit.best", out.best],
          ["demo.fit.behaviour", out.behaviour],
        ] as const
      ).map(([k, dd]) => el("div", {}, el("dt", {}, tr(k)), dd)),
    );
    draw();

    this.replaceChildren(
      el(
        "figure",
        {
          class: "sim-demo demo-2d",
          role: "group",
          "aria-label": tr("demo.fit.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.fit.title")),
        ),
        el(
          "div",
          { class: "demo-pair" },
          el("div", { class: "demo-view-panel" }, left),
          el("div", { class: "demo-view-panel" }, right),
        ),
        el("p", { class: "demo-legend muted" }, tr("demo.fit.legend")),
        el(
          "div",
          { class: "demo-controls demo-controls-one" },
          el(
            "div",
            {
              class: "sim-presets",
              role: "group",
              "aria-label": tr("demo.presets"),
            },
            el("span", { class: "muted" }, `${tr("demo.presets")}:`),
            ...presetButtons,
          ),
          stepSize.row,
          el(
            "div",
            { class: "sim-buttons" },
            button(tr("demo.fit.step"), () => steps(1)),
            button(tr("demo.fit.run"), () => steps(20)),
            button(tr("demo.reset"), reset),
          ),
        ),
        readouts,
      ),
    );
  }
}

function panel(label: string): SVGElement {
  return svg("svg", {
    viewBox: "0 0 320 280",
    class: "demo-svg demo-plot",
    role: "img",
    "aria-label": label,
  });
}

function clip(host: SVGElement): string {
  const id = `fit-clip-${Math.random().toString(36).slice(2, 8)}`;
  const c = svg("clipPath", { id });
  c.append(
    svg("rect", {
      x: BOX.left,
      y: BOX.top,
      width: BOX.right - BOX.left,
      height: BOX.bottom - BOX.top,
    }),
  );
  host.append(c);
  return `url(#${id})`;
}

function grid(
  host: SVGElement,
  ticks: number[],
  X: (v: number) => number,
  Y: (v: number) => number,
  lang: Parameters<typeof num>[0],
): void {
  for (const t of ticks) {
    host.append(
      svg("line", {
        x1: X(t),
        y1: BOX.top,
        x2: X(t),
        y2: BOX.bottom,
        class: "grid",
      }),
      svg("line", {
        x1: BOX.left,
        y1: Y(t),
        x2: BOX.right,
        y2: Y(t),
        class: "grid",
      }),
      text(X(t), BOX.bottom + 18, num(lang, t, 1), "tick-px middle"),
      text(BOX.left - 6, Y(t) + 4, num(lang, t, 1), "tick-px end"),
    );
  }
}

function axisLabels(host: SVGElement, xLabel: string, yLabel: string): void {
  host.append(
    text(
      (BOX.left + BOX.right) / 2,
      BOX.bottom + 38,
      xLabel,
      "label-px middle",
    ),
    text(BOX.left + 6, BOX.top + 14, yLabel, "label-px"),
  );
}

function text(x: number, y: number, content: string, cls: string): SVGElement {
  const t = svg("text", { x, y, class: cls });
  t.textContent = content;
  return t;
}

if (!customElements.get("fit-demo")) customElements.define("fit-demo", FitDemo);
