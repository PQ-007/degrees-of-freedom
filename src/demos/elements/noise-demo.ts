// <noise-demo>: averaging noisy readings (F3 Probability and statistics).
// A distance sensor reads a wall 2.00 m away with Gaussian noise σ. Over 500
// tries, single readings spread by σ; averages of N readings spread by σ/√N,
// at the cost of N readings' time. The maths is src/demos/models/stats.ts
// (unit-tested); a seeded generator makes each "New readings" repeatable.
import { el, num, pageLang, slider, svg, translator } from "../kit";
import { histogram, normalPdf, std, takeReadings } from "../models/stats";
import "../demo.css";

const TRUTH = 2;
const TRIALS = 500;
const RATE = 50; // readings a second
const LO = 1.4;
const HI = 2.6;
const BINS = 48;
const P = { left: 24, right: 616, top: 16, bottom: 270 };
const X = (m: number) => P.left + ((m - LO) / (HI - LO)) * (P.right - P.left);

class NoiseDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const m = tr("demo.unit.m");
    let sd = 0.08;
    let n = 4;
    let seed = 1;

    const plot = svg("svg", {
      viewBox: "0 0 640 320",
      class: "demo-svg demo-plot",
      role: "img",
      "aria-label": tr("demo.noise.view"),
    });
    for (let x = 1.4; x <= 2.6 + 1e-9; x += 0.2) {
      plot.append(
        svg("line", {
          x1: X(x),
          y1: P.top,
          x2: X(x),
          y2: P.bottom,
          class: "grid",
        }),
        text(X(x), P.bottom + 20, num(lang, x, 1), "tick-px middle"),
      );
    }
    plot.append(
      svg("line", {
        x1: P.left,
        y1: P.bottom,
        x2: P.right,
        y2: P.bottom,
        class: "axis-px",
      }),
      text(
        (P.left + P.right) / 2,
        P.bottom + 42,
        tr("demo.noise.axis"),
        "label-px middle",
      ),
    );
    const bars = svg("g");
    const curves = svg("g");
    plot.append(
      bars,
      curves,
      svg("line", {
        x1: X(TRUTH),
        y1: P.top,
        x2: X(TRUTH),
        y2: P.bottom,
        class: "target",
      }),
    );

    const out = {
      single: el("dd"),
      average: el("dd"),
      predicted: el("dd"),
      time: el("dd"),
    };
    const row = (key: Parameters<typeof tr>[0], dd: HTMLElement) =>
      el("div", {}, el("dt", {}, tr(key)), dd);
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      row("demo.noise.single", out.single),
      row("demo.noise.average", out.average),
      row("demo.noise.predicted", out.predicted),
      row("demo.noise.time", out.time),
    );

    const draw = () => {
      const r = takeReadings({ truth: TRUTH, sd, n, trials: TRIALS, seed });
      const w = (HI - LO) / BINS;
      const dens = (xs: number[]) =>
        histogram(xs, LO, HI, BINS).map((c) => c / (TRIALS * w));
      const singles = dens(r.singles);
      const averages = dens(r.averages);
      // Room for the tallest bars and the averages' bell curve, so nothing clips.
      const peak = normalPdf(TRUTH, TRUTH, sd / Math.sqrt(n));
      const top = Math.max(...singles, ...averages, peak, 1) * 1.08;
      const Y = (d: number) => P.bottom - (d / top) * (P.bottom - P.top);
      const barsFor = (ds: number[], cls: string) =>
        ds.map((d, i) =>
          svg("rect", {
            x: X(LO + i * w) + 1,
            y: Y(d),
            width: Math.max(0, X(LO + w) - X(LO) - 2),
            height: P.bottom - Y(d),
            class: cls,
          }),
        );
      bars.replaceChildren(
        ...barsFor(averages, "bar-fill"),
        ...barsFor(singles, "bar-outline"),
      );
      const curve = (s: number) => {
        const pts: string[] = [];
        for (let i = 0; i <= 240; i++) {
          const x = LO + (i / 240) * (HI - LO);
          pts.push(`${X(x)},${Y(normalPdf(x, TRUTH, s))}`);
        }
        return svg("polyline", { points: pts.join(" "), class: "bell" });
      };
      curves.replaceChildren(curve(sd), curve(sd / Math.sqrt(n)));
      out.single.textContent = `${num(lang, std(r.singles), 3)}\u00a0${m}`;
      out.average.textContent = `${num(lang, std(r.averages), 3)}\u00a0${m}`;
      out.predicted.textContent = `${num(lang, sd / Math.sqrt(n), 3)}\u00a0${m}`;
      out.time.textContent = `${num(lang, (n / RATE) * 1000, 0)}\u00a0${tr("demo.unit.ms")}`;
    };

    const noise = slider({
      label: tr("demo.noise.sd"),
      min: 0.02,
      max: 0.2,
      step: 0.01,
      value: sd,
      format: (v) => `${num(lang, v, 2)}\u00a0${m}`,
      onInput: (v) => {
        sd = v;
        draw();
      },
    });
    const count = slider({
      label: tr("demo.noise.n"),
      min: 1,
      max: 25,
      step: 1,
      value: n,
      format: (v) => String(v),
      onInput: (v) => {
        n = v;
        draw();
      },
    });
    const again = el(
      "button",
      { type: "button", class: "btn small" },
      `↻ ${tr("demo.noise.again")}`,
    );
    again.addEventListener("click", () => {
      seed += 1;
      draw();
    });
    draw();

    this.replaceChildren(
      el(
        "figure",
        {
          class: "sim-demo demo-2d",
          role: "group",
          "aria-label": tr("demo.noise.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.noise.title")),
        ),
        el("div", { class: "demo-view demo-view-hist" }, plot),
        el("p", { class: "demo-legend muted" }, tr("demo.noise.legend")),
        el(
          "div",
          { class: "demo-controls demo-controls-one" },
          noise.row,
          count.row,
          el("div", { class: "sim-buttons" }, again),
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

if (!customElements.get("noise-demo"))
  customElements.define("noise-demo", NoiseDemo);
