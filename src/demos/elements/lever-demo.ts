// <lever-demo>: can this motor hold it? (F5 Mechanics). A motor at the
// shoulder holds a weight at the end of an arm; mass, length and angle are
// sliders. The torque it needs is the weight times the lever arm, the
// horizontal distance from the joint, drawn dashed; it is compared with a
// real motor's stall torque (DYNAMIXEL XL430-W250-T, 1.4 N·m, cited on the
// page). The maths is src/demos/models/lever.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import {
  XL430_STALL,
  holdingTorque,
  maxMass,
  toRadians,
  verdict,
} from "../models/lever";
import "../demo.css";

/** Drawing units: the joint, and pixels per metre. */
const J = { x: 230, y: 190 };
const PX = 800;

class LeverDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const kg = tr("demo.unit.kg");
    const nm = tr("demo.unit.nm");
    const m = tr("demo.unit.m");
    let mass = 0.5;
    let length = 0.2;
    let angle = 0;

    const view = svg("svg", {
      viewBox: "0 0 640 360",
      class: "demo-svg demo-plot",
      role: "img",
      "aria-label": tr("demo.lever.view"),
    });
    // The stand, the motor at the shoulder, then the moving parts.
    view.append(
      svg("line", { x1: 100, y1: 330, x2: 600, y2: 330, class: "axis-px" }),
      svg("rect", { x: 210, y: 210, width: 40, height: 120, class: "stand" }),
    );
    const leverLine = svg("line", { class: "lever-arm" });
    const plumb = svg("line", { class: "plumb" });
    const arm = svg("line", { class: "arm" });
    const string = svg("line", { class: "string" });
    const block = svg("rect", {
      width: 40,
      height: 34,
      rx: 3,
      class: "weight",
    });
    const force = svg("line", { class: "force" });
    const head = svg("polygon", { class: "force-head" });
    const rLabel = svg("text", { class: "label-px middle math" });
    rLabel.textContent = "r⊥";
    const fLabel = svg("text", { class: "label-px math" });
    fLabel.textContent = "mg";
    view.append(
      leverLine,
      plumb,
      arm,
      string,
      block,
      force,
      head,
      rLabel,
      fLabel,
      svg("circle", { cx: J.x, cy: J.y, r: 26, class: "motor" }),
      svg("circle", { cx: J.x, cy: J.y, r: 6, class: "hub" }),
    );

    const out = {
      torque: el("dd"),
      share: el("dd"),
      max: el("dd"),
      verdict: el("dd", { "aria-live": "polite" }),
    };
    const draw = () => {
      const a = toRadians(angle);
      const tip = {
        x: J.x + length * PX * Math.cos(a),
        y: J.y - length * PX * Math.sin(a),
      };
      const set = (node: SVGElement, attrs: Record<string, number>) => {
        for (const [k, v] of Object.entries(attrs))
          node.setAttribute(k, String(v));
      };
      set(arm, { x1: J.x, y1: J.y, x2: tip.x, y2: tip.y });
      set(leverLine, { x1: J.x, y1: J.y, x2: tip.x, y2: J.y });
      set(plumb, {
        x1: tip.x,
        y1: Math.min(J.y, tip.y),
        x2: tip.x,
        y2: Math.max(J.y, tip.y + 60),
      });
      set(string, { x1: tip.x, y1: tip.y, x2: tip.x, y2: tip.y + 24 });
      set(block, { x: tip.x - 20, y: tip.y + 24 });
      const len = 18 + 36 * mass;
      const top = tip.y + 58;
      set(force, { x1: tip.x, y1: top, x2: tip.x, y2: top + len - 8 });
      head.setAttribute(
        "points",
        `${tip.x - 7},${top + len - 10} ${tip.x + 7},${top + len - 10} ${tip.x},${top + len + 2}`,
      );
      set(rLabel, { x: (J.x + tip.x) / 2, y: J.y + 34 });
      set(fLabel, { x: tip.x + 12, y: top + len / 2 + 5 });

      const torque = holdingTorque(mass, length, angle);
      const most = maxMass(length, angle);
      out.torque.textContent = `${num(lang, torque, 2)} ${nm}`;
      out.share.textContent = `${num(lang, (torque / XL430_STALL) * 100, 0)}%`;
      out.max.textContent = Number.isFinite(most)
        ? `${num(lang, most, 2)} ${kg}`
        : tr("demo.lever.any");
      const v = verdict(torque);
      out.verdict.textContent = tr(`demo.lever.${v}`);
      view.classList.toggle("is-sagging", v === "sags");
    };

    const sliders = [
      slider({
        label: tr("demo.lever.mass"),
        min: 0,
        max: 2,
        step: 0.05,
        value: mass,
        format: (v) => `${num(lang, v, 2)} ${kg}`,
        onInput: (v) => ((mass = v), draw()),
      }),
      slider({
        label: tr("demo.lever.length"),
        min: 0.05,
        max: 0.4,
        step: 0.01,
        value: length,
        format: (v) => `${num(lang, v, 2)} ${m}`,
        onInput: (v) => ((length = v), draw()),
      }),
      slider({
        label: tr("demo.lever.angle"),
        min: -60,
        max: 90,
        step: 1,
        value: angle,
        format: (v) => `${num(lang, v, 0)}°`,
        onInput: (v) => ((angle = v), draw()),
      }),
    ];
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.lever.torque", out.torque],
          ["demo.lever.share", out.share],
          ["demo.lever.max", out.max],
          ["demo.lever.verdict", out.verdict],
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
          "aria-label": tr("demo.lever.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.lever.title")),
        ),
        el("div", { class: "demo-view demo-view-plot" }, view),
        el("p", { class: "demo-legend muted" }, tr("demo.lever.legend")),
        el(
          "div",
          { class: "demo-controls demo-controls-one" },
          ...sliders.map((s) => s.row),
        ),
        readouts,
      ),
    );
  }
}

if (!customElements.get("lever-demo"))
  customElements.define("lever-demo", LeverDemo);
