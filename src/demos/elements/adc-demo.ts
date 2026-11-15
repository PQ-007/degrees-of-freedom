// <adc-demo>: turning a voltage into a number (F9 How computers work).
// A sensor's voltage, between 0 and 5 V, goes into an analog-to-digital
// converter with as many bits as you choose. With few bits the reading is a
// coarse staircase; each extra bit doubles the number of steps. A marker
// shows one reading, as a number and in binary. The maths is
// src/demos/models/adc.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import {
  binary,
  levels,
  reading,
  signal,
  stepSize,
  voltageOf,
} from "../models/adc";
import "../demo.css";

const VREF = 5;
const MARK = 0.3; // the marker's time, s
const P = { left: 60, right: 620, top: 16, bottom: 270 };

class AdcDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const V = tr("demo.unit.v");
    let bits = 3;

    const plot = svg("svg", {
      viewBox: "0 0 660 330",
      class: "demo-svg demo-plot",
      role: "img",
      "aria-label": tr("demo.adc.view"),
    });
    const X = (t: number) => P.left + t * (P.right - P.left);
    const Y = (v: number) => P.bottom - (v / VREF) * (P.bottom - P.top);
    for (const v of [0, 1, 2, 3, 4, 5]) {
      plot.append(text(P.left - 8, Y(v) + 4, num(lang, v, 0), "tick-px end"));
    }
    plot.append(
      svg("line", {
        x1: P.left,
        y1: P.bottom,
        x2: P.right,
        y2: P.bottom,
        class: "axis-px",
      }),
      text(P.left, 312, tr("demo.adc.axisV"), "label-px"),
      text(P.right, 312, tr("demo.adc.axisT"), "label-px end"),
    );
    // The step boundaries (only while there are few enough to see).
    const grid = svg("g", {});
    const truth = svg("polyline", { class: "exact" });
    const stairs = svg("polyline", { class: "euler" });
    const marker = svg("line", {
      x1: X(MARK),
      x2: X(MARK),
      y1: P.top,
      y2: P.bottom,
      class: "target",
    });
    const dot = svg("circle", { cx: X(MARK), r: 7, class: "point" });
    plot.append(grid, truth, stairs, marker, dot);

    const N = 560;
    const ts = Array.from({ length: N + 1 }, (_, i) => i / N);
    truth.setAttribute(
      "points",
      ts.map((t) => `${X(t)},${Y(signal(t))}`).join(" "),
    );

    const out = {
      values: el("dd"),
      step: el("dd"),
      reading: el("dd"),
      binary: el("dd", { class: "mono" }),
    };
    const draw = () => {
      const n = levels(bits);
      grid.replaceChildren(
        ...(n <= 32
          ? Array.from({ length: n - 1 }, (_, i) =>
              svg("line", {
                x1: P.left,
                x2: P.right,
                y1: Y((i + 1) * stepSize(bits, VREF)),
                y2: Y((i + 1) * stepSize(bits, VREF)),
                class: "grid",
              }),
            )
          : []),
      );
      // A staircase: hold each reading's voltage until the next sample.
      const pts: string[] = [];
      let prev: number | undefined;
      for (const t of ts) {
        const q = voltageOf(reading(signal(t), bits, VREF), bits, VREF);
        if (prev !== undefined && q !== prev) pts.push(`${X(t)},${Y(prev)}`);
        pts.push(`${X(t)},${Y(q)}`);
        prev = q;
      }
      stairs.setAttribute("points", pts.join(" "));
      const k = reading(signal(MARK), bits, VREF);
      dot.setAttribute("cy", String(Y(voltageOf(k, bits, VREF))));
      const mv = stepSize(bits, VREF) * 1000;
      out.values.textContent = `${num(lang, n, 0)} (0–${num(lang, n - 1, 0)})`;
      out.step.textContent =
        mv >= 100
          ? `${num(lang, mv / 1000, 2)} ${V}`
          : `${num(lang, mv, mv < 10 ? 2 : 1)} ${tr("demo.unit.mv")}`;
      out.reading.textContent = `${num(lang, k, 0)} (${tr("demo.adc.of")} ${num(lang, signal(MARK), 3)} ${V})`;
      out.binary.textContent = binary(k, bits);
    };

    const bitsSlider = slider({
      label: tr("demo.adc.bits"),
      min: 1,
      max: 12,
      step: 1,
      value: bits,
      format: (v) => `${v}`,
      onInput: (v) => {
        bits = v;
        draw();
      },
    });
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.adc.values", out.values],
          ["demo.adc.step", out.step],
          ["demo.adc.reading", out.reading],
          ["demo.adc.binary", out.binary],
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
          "aria-label": tr("demo.adc.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.adc.title")),
        ),
        el("div", { class: "demo-view demo-view-pwm" }, plot),
        el("p", { class: "demo-legend muted" }, tr("demo.adc.legend")),
        el("div", { class: "demo-controls demo-controls-one" }, bitsSlider.row),
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

if (!customElements.get("adc-demo")) customElements.define("adc-demo", AdcDemo);
