// <drive-demo>: steering a differential-drive robot (C3 Locomotion
// mechanisms). Set the left and right wheels' speeds; the drawing shows the
// robot's path over two seconds from above, its wheel tracks, and the point
// it turns around. The maths is src/demos/models/diffdrive.ts (unit-tested).
import { el, num, pageLang, slider, svg, translator } from "../kit";
import {
  body,
  path,
  poseAt,
  radius,
  wheelAt,
  type Pose,
} from "../models/diffdrive";
import "../demo.css";

const W = 0.3; // track width, m
const T = 2; // seconds of driving shown
const START: Pose = { x: 0, y: 0, heading: Math.PI / 2 };
const toDeg = (r: number) => (r * 180) / Math.PI;

/** The robot seen from above, in its own frame (forward = +x), SVG y down. */
function robotShape(): SVGElement[] {
  return [
    svg("rect", {
      x: -0.14,
      y: -0.12,
      width: 0.24,
      height: 0.24,
      class: "chassis",
    }),
    svg("rect", {
      x: -0.05,
      y: -0.168,
      width: 0.1,
      height: 0.036,
      class: "wheel",
    }),
    svg("rect", {
      x: -0.05,
      y: 0.132,
      width: 0.1,
      height: 0.036,
      class: "wheel",
    }),
    svg("circle", { cx: -0.1, cy: 0, r: 0.018, class: "caster" }),
    svg("polygon", { points: "0.1,0 0.04,-0.05 0.04,0.05", class: "nose" }),
  ];
}

class DriveDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const ms = tr("demo.unit.mps");
    let vL = 0.15;
    let vR = 0.3;

    const view = svg("svg", {
      viewBox: "-1.6 -0.9 3.2 1.8",
      class: "demo-svg demo-drive",
      role: "img",
      "aria-label": tr("demo.drive.view"),
    });
    for (let x = -1.6; x <= 1.6001; x += 0.2)
      view.append(
        svg("line", { x1: x, y1: -0.9, x2: x, y2: 0.9, class: "grid" }),
      );
    for (let y = -0.8; y <= 0.8001; y += 0.2)
      view.append(
        svg("line", { x1: -1.6, y1: y, x2: 1.6, y2: y, class: "grid" }),
      );
    const ghost = svg("g", {
      class: "ghost",
      transform: `translate(0 0) rotate(${-toDeg(START.heading)})`,
    });
    ghost.append(...robotShape());
    const trackL = svg("polyline", { class: "wheel-track" });
    const trackR = svg("polyline", { class: "wheel-track" });
    const centre = svg("polyline", { class: "drive-path" });
    const icr = svg("g", { class: "icr" });
    const robot = svg("g", { class: "robot" });
    robot.append(...robotShape());
    view.append(ghost, trackL, trackR, centre, icr, robot);

    const out = {
      v: el("dd"),
      omega: el("dd"),
      r: el("dd"),
      turned: el("dd"),
    };
    const pts = (ps: { x: number; y: number }[]) =>
      ps.map((p) => `${p.x.toFixed(4)},${(-p.y).toFixed(4)}`).join(" ");

    const draw = () => {
      const poses = path(START, vL, vR, W, T);
      centre.setAttribute("points", pts(poses));
      trackL.setAttribute("points", pts(poses.map((p) => wheelAt(p, W, 1))));
      trackR.setAttribute("points", pts(poses.map((p) => wheelAt(p, W, -1))));
      const end = poseAt(START, vL, vR, W, T);
      robot.setAttribute(
        "transform",
        `translate(${end.x.toFixed(4)} ${(-end.y).toFixed(4)}) rotate(${-toDeg(end.heading)})`,
      );
      // The point it turns around: on the axle's line, R to the left.
      const R = radius(vL, vR, W);
      icr.replaceChildren();
      if (Number.isFinite(R) && Math.abs(R) < 1.5) {
        const c = { x: START.x - R, y: START.y }; // heading up: left is −x
        const s = 0.04;
        icr.append(
          svg("line", { x1: c.x - s, y1: -c.y - s, x2: c.x + s, y2: -c.y + s }),
          svg("line", { x1: c.x - s, y1: -c.y + s, x2: c.x + s, y2: -c.y - s }),
        );
      }

      const { v, omega } = body(vL, vR, W);
      out.v.textContent = `${num(lang, v, 2)} ${ms}`;
      out.omega.textContent = `${num(lang, toDeg(omega), 0)} ${tr("demo.unit.degs")}`;
      const side = R > 0 ? tr("demo.drive.left") : tr("demo.drive.right");
      out.r.textContent = !Number.isFinite(R)
        ? tr("demo.drive.straight")
        : Math.abs(R) < 1e-9
          ? tr("demo.drive.inPlace")
          : `${num(lang, Math.abs(R), 2)} ${tr("demo.unit.m")}, ${side}`;
      out.turned.textContent = `${num(lang, toDeg(omega * T), 0)}${tr("demo.unit.deg")}`;
    };

    const speed = (label: string, value: number, set: (v: number) => void) =>
      slider({
        label,
        min: -0.4,
        max: 0.4,
        step: 0.05,
        value,
        format: (v) => `${num(lang, v, 2)} ${ms}`,
        onInput: (v) => {
          set(v);
          draw();
        },
      });
    const left = speed(tr("demo.drive.vL"), vL, (v) => (vL = v));
    const right = speed(tr("demo.drive.vR"), vR, (v) => (vR = v));
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      ...(
        [
          ["demo.drive.v", out.v],
          ["demo.drive.omega", out.omega],
          ["demo.drive.r", out.r],
          ["demo.drive.turned", out.turned],
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
          "aria-label": tr("demo.drive.title"),
        },
        el(
          "div",
          { class: "sim-head" },
          el("span", { class: "label" }, tr("demo.label")),
          el("strong", {}, tr("demo.drive.title")),
        ),
        el("div", { class: "demo-view" }, view),
        el("p", { class: "demo-legend muted" }, tr("demo.drive.legend")),
        el("div", { class: "demo-controls" }, left.row, right.row),
        readouts,
      ),
    );
  }
}

if (!customElements.get("drive-demo"))
  customElements.define("drive-demo", DriveDemo);
