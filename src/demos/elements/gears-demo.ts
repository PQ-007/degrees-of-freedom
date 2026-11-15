// <gears-demo>: a gear pair trading speed for torque, with backlash (C2
// Transmissions). A 12-tooth gear on a small motor drives a bigger gear; turn
// the motor with a slider and the output follows, slower, the other way. Add
// backlash and reverse: the output waits until the motor has crossed the gap.
// The maths is src/demos/models/gears.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import {
  follow,
  gearOutline,
  idealOutput,
  outputSpeed,
  outputTorque,
  ratio,
} from "../models/gears";
import "../demo.css";

const Z_IN = 12;
const MODULE = 4.6; // drawing units per tooth size
const MOTOR_RPM = 6000; // the demo's small motor (an assumption)
const MOTOR_TORQUE = 0.05; // N·m (an assumption)
const CY = 160;

class GearsDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const deg = tr("demo.unit.deg");
    let zOut = 36;
    let gap = 0;
    let motor = 0;
    let out = 0;

    const view = svg("svg", {
      viewBox: "0 0 660 330",
      class: "demo-svg demo-gears",
      role: "img",
      "aria-label": tr("demo.gears.view"),
    });
    const gear = (cls: string) => {
      const g = svg("g", { class: cls });
      const body = svg("polygon", { class: "gear-body" });
      const spoke = svg("line", { class: "spoke" });
      const hub = svg("circle", { r: 6, class: "hub" });
      g.append(body, spoke, hub);
      return { g, body, spoke, hub };
    };
    const input = gear("gear-in");
    const output = gear("gear-out");
    view.append(input.g, output.g);

    const outs = {
      ratio: el("dd"),
      speed: el("dd"),
      torque: el("dd"),
      angle: el("dd"),
    };
    let geo = { xIn: 0, xOut: 0, rIn: 0, rOut: 0 };

    const shape = () => {
      const rIn = (MODULE * Z_IN) / 2;
      const rOut = (MODULE * zOut) / 2;
      const width = 2 * (rIn + rOut + MODULE);
      const xIn = 330 - width / 2 + rIn + MODULE;
      geo = { xIn, xOut: xIn + rIn + rOut, rIn, rOut };
      const pts = (p: [number, number][], cx: number) =>
        p
          .map(([x, y]) => `${(cx + x).toFixed(2)},${(CY - y).toFixed(2)}`)
          .join(" ");
      const pOut = (2 * Math.PI) / zOut;
      input.body.setAttribute("points", pts(gearOutline(Z_IN, rIn, 0), xIn));
      output.body.setAttribute(
        "points",
        pts(gearOutline(zOut, rOut, Math.PI + pOut / 2), geo.xOut),
      );
      for (const [g, cx, r] of [
        [input, xIn, rIn],
        [output, geo.xOut, rOut],
      ] as const) {
        g.hub.setAttribute("cx", String(cx));
        g.hub.setAttribute("cy", String(CY));
        g.spoke.setAttribute("x1", String(cx));
        g.spoke.setAttribute("y1", String(CY));
        g.spoke.setAttribute("x2", String(cx));
        g.spoke.setAttribute("y2", String(CY - r * 0.8));
      }
    };

    const draw = () => {
      const n = ratio(Z_IN, zOut);
      const ideal = idealOutput(motor, n);
      out = follow(out, ideal, gap);
      // SVG turns clockwise; our angles turn anticlockwise.
      input.g.setAttribute("transform", `rotate(${-motor} ${geo.xIn} ${CY})`);
      output.g.setAttribute("transform", `rotate(${-out} ${geo.xOut} ${CY})`);
      outs.ratio.textContent = `${num(lang, n, 1)} : 1`;
      outs.speed.textContent = `${num(lang, outputSpeed(MOTOR_RPM, n), 0)} ${tr("demo.unit.rpm")}`;
      outs.torque.textContent = `${num(lang, outputTorque(MOTOR_TORQUE, n), 2)} ${tr("demo.unit.nm")}`;
      const lag = Math.abs(out - ideal) > 1e-9;
      outs.angle.textContent =
        `${num(lang, out, 1)}${deg}` +
        (lag
          ? ` (${tr("demo.gears.ideal")} ${num(lang, ideal, 1)}${deg})`
          : "");
    };

    const motorSlider = slider({
      label: tr("demo.gears.motor"),
      min: -720,
      max: 720,
      step: 10,
      value: 0,
      format: (v) => `${num(lang, v, 0)}${deg}`,
      onInput: (v) => {
        motor = v;
        draw();
      },
    });
    const restart = () => {
      out = idealOutput(motor, ratio(Z_IN, zOut));
      shape();
      draw();
    };
    const teethSlider = slider({
      label: tr("demo.gears.teeth"),
      min: 12,
      max: 60,
      step: 6,
      value: zOut,
      format: (v) => `${v}`,
      onInput: (v) => {
        zOut = v;
        restart();
      },
    });
    const gapSlider = slider({
      label: tr("demo.gears.backlash"),
      min: 0,
      max: 6,
      step: 1,
      value: 0,
      format: (v) => `${v}${deg}`,
      onInput: (v) => {
        gap = v;
        restart();
      },
    });
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.gears.ratio", outs.ratio],
          ["demo.gears.speed", outs.speed],
          ["demo.gears.torque", outs.torque],
          ["demo.gears.angle", outs.angle],
        ] as const
      ).map(([k, dd]) => el("div", {}, el("dt", {}, tr(k)), dd)),
    );
    shape();
    draw();

    this.replaceChildren(
      el(
        "figure",
        {
          class: "sim-demo demo-2d",
          role: "group",
          "aria-label": tr("demo.gears.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.gears.title")),
        ),
        el("div", { class: "demo-view demo-view-pwm" }, view),
        el("p", { class: "demo-legend muted" }, tr("demo.gears.legend")),
        el(
          "div",
          { class: "demo-controls" },
          motorSlider.row,
          teethSlider.row,
          gapSlider.row,
        ),
        readouts,
      ),
    );
  }
}

if (!customElements.get("gears-demo"))
  customElements.define("gears-demo", GearsDemo);
