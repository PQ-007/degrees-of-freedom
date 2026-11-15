// <reach-demo>: the workspace of a two-joint arm (C1 Mechanisms and
// structure). Choose the two links' lengths and how far each joint can turn;
// the shaded area is everywhere the tip can reach. Equal links reach right
// back to the shoulder; a limited elbow leaves a hole round it; a limited
// shoulder narrows the ring to a fan. The maths is
// src/demos/models/workspace.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import { arcsAt, area, forward, reach, type Arm } from "../models/workspace";
import "../demo.css";

const deg = (d: number) => (d * Math.PI) / 180;
const RINGS = 90;

class ReachDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const m = tr("demo.unit.m");
    const arm: Arm = { l1: 0.3, l2: 0.2, shoulder: Math.PI, elbow: Math.PI };

    // Metres, y up (the drawing flips y): the shoulder at the origin.
    const view = svg("svg", {
      viewBox: "-1.95 -1.1 3.9 2.2",
      class: "demo-svg demo-reach",
      role: "img",
      "aria-label": tr("demo.reach.view"),
    });
    for (const r of [0.25, 0.5, 0.75, 1]) {
      view.append(svg("circle", { cx: 0, cy: 0, r, class: "grid" }));
    }
    for (const r of [0.5, 1]) {
      const t = svg("text", { x: r + 0.03, y: -0.03, class: "ring-label" });
      t.textContent = `${num(lang, r, 1)} ${m}`;
      view.append(t);
    }
    const shade = svg("path", { class: "reach-area" });
    const limits = svg("g", {});
    const link1 = svg("line", { class: "link" });
    const link2 = svg("line", { class: "link" });
    const base = svg("polygon", {
      points: "-0.07,0.09 0.07,0.09 0,0",
      class: "fixed",
    });
    const shoulder = svg("circle", { r: 0.028, class: "body" });
    const elbow = svg("circle", { r: 0.028, class: "body" });
    const tip = svg("circle", { r: 0.032, class: "point" });
    view.append(shade, limits, base, link1, link2, shoulder, elbow, tip);

    const ray = (x: number, y: number, a: number, len: number) =>
      svg("line", {
        x1: x,
        y1: -y,
        x2: x + len * Math.cos(a),
        y2: -(y + len * Math.sin(a)),
        class: "ray",
      });

    const out = {
      far: el("dd"),
      near: el("dd"),
      area: el("dd"),
      dof: el("dd"),
    };
    const draw = () => {
      const { min, max } = reach(arm);
      // The workspace as thin rings, each split into the arcs it covers.
      const dr = (max - min) / RINGS;
      let d = "";
      for (let i = 0; i < RINGS; i++) {
        const r0 = min + i * dr;
        const r1 = r0 + dr * 1.6; // overlap the next ring: no seams
        for (const [from, to] of arcsAt(arm, r0 + dr / 2)) {
          const n = Math.max(2, Math.ceil(((to - from) / (2 * Math.PI)) * 72));
          const pts: string[] = [];
          for (let k = 0; k <= n; k++) {
            const a = from + ((to - from) * k) / n;
            pts.push(
              `${(r1 * Math.cos(a)).toFixed(4)},${(-r1 * Math.sin(a)).toFixed(4)}`,
            );
          }
          for (let k = n; k >= 0; k--) {
            const a = from + ((to - from) * k) / n;
            pts.push(
              `${(r0 * Math.cos(a)).toFixed(4)},${(-r0 * Math.sin(a)).toFixed(4)}`,
            );
          }
          d += `M${pts.join("L")}Z`;
        }
      }
      shade.setAttribute("d", d);

      // A pose inside the limits, so the arm shows how it bends.
      const q1 = 0.5 * Math.min(arm.shoulder, deg(80));
      const q2 = -0.6 * Math.min(arm.elbow, deg(150));
      const p = forward(arm, q1, q2);
      for (const [line, a, b] of [
        [link1, { x: 0, y: 0 }, p.elbow],
        [link2, p.elbow, p.tip],
      ] as const) {
        line.setAttribute("x1", String(a.x));
        line.setAttribute("y1", String(-a.y));
        line.setAttribute("x2", String(b.x));
        line.setAttribute("y2", String(-b.y));
      }
      elbow.setAttribute("cx", String(p.elbow.x));
      elbow.setAttribute("cy", String(-p.elbow.y));
      tip.setAttribute("cx", String(p.tip.x));
      tip.setAttribute("cy", String(-p.tip.y));
      // Dashed lines at the joints' limits, when they have any.
      limits.replaceChildren();
      if (arm.shoulder < Math.PI)
        limits.append(
          ray(0, 0, arm.shoulder, arm.l1 + arm.l2),
          ray(0, 0, -arm.shoulder, arm.l1 + arm.l2),
        );
      if (arm.elbow < Math.PI)
        limits.append(
          ray(p.elbow.x, p.elbow.y, q1 + arm.elbow, arm.l2),
          ray(p.elbow.x, p.elbow.y, q1 - arm.elbow, arm.l2),
        );

      out.far.textContent = `${num(lang, max, 2)} ${m}`;
      out.near.textContent = `${num(lang, min, 2)} ${m}`;
      out.area.textContent = `${num(lang, area(arm), 2)} ${tr("demo.unit.m2")}`;
      out.dof.textContent = tr("demo.reach.dofValue");
    };

    const cm = (v: number) => `${v} ${tr("demo.unit.cm")}`;
    const turn = (v: number) => `±${v}${tr("demo.unit.deg")}`;
    const sliders = [
      slider({
        label: tr("demo.reach.l1"),
        min: 10,
        max: 50,
        step: 5,
        value: 30,
        format: cm,
        onInput: (v) => {
          arm.l1 = v / 100;
          draw();
        },
      }),
      slider({
        label: tr("demo.reach.l2"),
        min: 10,
        max: 50,
        step: 5,
        value: 20,
        format: cm,
        onInput: (v) => {
          arm.l2 = v / 100;
          draw();
        },
      }),
      slider({
        label: tr("demo.reach.shoulder"),
        min: 15,
        max: 180,
        step: 15,
        value: 180,
        format: turn,
        onInput: (v) => {
          arm.shoulder = deg(v);
          draw();
        },
      }),
      slider({
        label: tr("demo.reach.elbow"),
        min: 15,
        max: 180,
        step: 15,
        value: 180,
        format: turn,
        onInput: (v) => {
          arm.elbow = deg(v);
          draw();
        },
      }),
    ];
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.reach.far", out.far],
          ["demo.reach.near", out.near],
          ["demo.reach.area", out.area],
          ["demo.reach.dof", out.dof],
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
          "aria-label": tr("demo.reach.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.reach.title")),
        ),
        el("div", { class: "demo-view" }, view),
        el("p", { class: "demo-legend muted" }, tr("demo.reach.legend")),
        el("div", { class: "demo-controls" }, ...sliders.map((s) => s.row)),
        readouts,
      ),
    );
  }
}

if (!customElements.get("reach-demo"))
  customElements.define("reach-demo", ReachDemo);
