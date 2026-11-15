// <pwm-demo>: PWM, switching to an in-between speed (F7 Electronics basics).
// A 12 V supply is switched fully on and off; the duty cycle sets the
// average voltage, and a motor that takes about 0.05 s to respond settles at
// that share of its full speed. Slow switching makes its speed rise and fall
// with every pulse; fast switching smooths it out. The maths is
// src/demos/models/pwm.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import { averageVoltage, speedRange, waveform } from "../models/pwm";
import "../demo.css";

const SUPPLY = 12;
const FREQS = [2, 5, 10, 20, 50, 100, 200, 500];
const P = { left: 60, right: 600, top: 16, bottom: 270 };

class PwmDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const V = tr("demo.unit.v");
    let duty = 0.5;
    let fIndex = 2;

    const plot = svg("svg", {
      viewBox: "0 0 660 330",
      class: "demo-svg demo-plot",
      role: "img",
      "aria-label": tr("demo.pwm.view"),
    });
    const Y = (share: number) => P.bottom - share * (P.bottom - P.top);
    for (const share of [0, 0.25, 0.5, 0.75, 1]) {
      plot.append(
        svg("line", {
          x1: P.left,
          y1: Y(share),
          x2: P.right,
          y2: Y(share),
          class: "grid",
        }),
        text(
          P.left - 8,
          Y(share) + 4,
          num(lang, share * SUPPLY, 0),
          "tick-px end",
        ),
        text(P.right + 8, Y(share) + 4, `${share * 100}`, "tick-px"),
      );
    }
    plot.append(
      text(P.left, 312, tr("demo.pwm.axisV"), "label-px"),
      text(P.right, 312, tr("demo.pwm.axisS"), "label-px end"),
    );
    const timeLabel = text(
      (P.left + P.right) / 2,
      P.bottom + 20,
      "",
      "label-px middle",
    );
    const square = svg("polyline", { class: "exact" });
    const avg = svg("line", { class: "target" });
    const speed = svg("polyline", { class: "euler" });
    plot.append(timeLabel, square, avg, speed);

    const out = {
      avg: el("dd"),
      speed: el("dd"),
      ripple: el("dd"),
      on: el("dd"),
    };
    const draw = () => {
      const f = FREQS[fIndex] ?? 10;
      const pts = waveform(duty, f, 3, 240);
      const end = pts.at(-1)?.[0] ?? 1;
      const X = (t: number) => P.left + (t / end) * (P.right - P.left);
      square.setAttribute(
        "points",
        pts.map(([t, u]) => `${X(t)},${Y(u)}`).join(" "),
      );
      speed.setAttribute(
        "points",
        pts.map(([t, , s]) => `${X(t)},${Y(s)}`).join(" "),
      );
      for (const [k, v] of [
        ["x1", P.left],
        ["x2", P.right],
        ["y1", Y(duty)],
        ["y2", Y(duty)],
      ] as const)
        avg.setAttribute(k, String(v));
      timeLabel.textContent = `${tr("demo.pwm.axisT")}: 0–${num(lang, end * 1000, end * 1000 < 10 ? 1 : 0)}`;
      const r = speedRange(duty, f);
      out.avg.textContent = `${num(lang, averageVoltage(duty, SUPPLY), 1)} ${V}`;
      out.speed.textContent = `${num(lang, duty * 100, 0)}%`;
      out.ripple.textContent = `${num(lang, (r.max - r.min) * 100, 1)}%`;
      out.on.textContent = `${num(lang, (duty / f) * 1000, 1)} ms`;
    };

    const dutySlider = slider({
      label: tr("demo.pwm.duty"),
      min: 0,
      max: 100,
      step: 5,
      value: duty * 100,
      format: (v) => `${v}%`,
      onInput: (v) => {
        duty = v / 100;
        draw();
      },
    });
    const freqSlider = slider({
      label: tr("demo.pwm.freq"),
      min: 0,
      max: FREQS.length - 1,
      step: 1,
      value: fIndex,
      format: (v) => `${FREQS[v] ?? 0} ${tr("demo.unit.hz")}`,
      onInput: (v) => {
        fIndex = v;
        draw();
      },
    });
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.pwm.avg", out.avg],
          ["demo.pwm.speed", out.speed],
          ["demo.pwm.ripple", out.ripple],
          ["demo.pwm.on", out.on],
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
          "aria-label": tr("demo.pwm.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.pwm.title")),
        ),
        el("div", { class: "demo-view demo-view-pwm" }, plot),
        el("p", { class: "demo-legend muted" }, tr("demo.pwm.legend")),
        el(
          "div",
          { class: "demo-controls demo-controls-one" },
          dutySlider.row,
          freqSlider.row,
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

if (!customElements.get("pwm-demo")) customElements.define("pwm-demo", PwmDemo);
