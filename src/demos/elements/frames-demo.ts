// <frames-demo>: one point, two frames (F1 Geometry and linear algebra).
//
// A robot on a map, and a point P its sensor sees. P is given in the robot's
// frame (ahead, to the left); move or turn the robot and P's world
// coordinates change while its robot coordinates don't. The readouts show
// both, the heading in degrees and radians, and the rotation matrix with
// live numbers. The maths is src/demos/models/frames.ts (unit-tested).
import {
  el,
  num,
  pageLang,
  slider,
  svg,
  translator,
  type Slider,
} from "../kit";
import {
  rotation,
  toDegrees,
  toRadians,
  toWorld,
  type Pose,
  type Vec2,
} from "../models/frames";
import "../demo.css";

/** The map: x from −0.6 to 5.6 m, y from −0.49 to 3 m (16:9). */
const VIEW = { x: -0.6, y: -0.4875, w: 6.2, h: 3.4875 };

class FramesDemo extends HTMLElement {
  private built = false;

  connectedCallback(): void {
    if (this.built) return;
    this.built = true;
    const lang = pageLang(this);
    const tr = translator(lang);
    const m = tr("demo.unit.m");
    const pose: Pose = { x: 1.5, y: 1, theta: toRadians(30) };
    const seen: Vec2 = [1.6, 0.6];

    // The map. SVG's y points down, so world y is drawn as −y.
    const map = svg("svg", {
      viewBox: `${VIEW.x} ${-(VIEW.y + VIEW.h)} ${VIEW.w} ${VIEW.h}`,
      class: "demo-svg",
      role: "img",
      "aria-label": tr("demo.frames.view"),
    });
    for (let x = -0.5; x <= 5.5; x += 0.5)
      map.append(svg("line", { x1: x, y1: 0.5, x2: x, y2: -3, class: "grid" }));
    for (let y = 0; y <= 3; y += 0.5)
      map.append(
        svg("line", { x1: -0.6, y1: -y, x2: 5.6, y2: -y, class: "grid" }),
      );
    for (let x = 1; x <= 5; x++)
      map.append(
        Object.assign(svg("text", { x, y: 0.3, class: "tick" }), {
          textContent: String(x),
        }),
      );
    for (let y = 1; y <= 2; y++)
      map.append(
        Object.assign(svg("text", { x: -0.35, y: -y + 0.06, class: "tick" }), {
          textContent: String(y),
        }),
      );
    // The world's frame: fixed, in ink.
    map.append(
      ...arrow([0, 0], [1, 0], "axis"),
      ...arrow([0, 0], [0, 1], "axis"),
    );
    map.append(label([1.2, 0], "X", "fixed"), label([0, 1.2], "Y", "fixed"));

    // The robot's frame and body, and P: redrawn from the pose.
    const robot = svg("g");
    const ray = svg("line", { class: "ray" });
    const p = svg("circle", { r: 0.09, class: "point" });
    const pLabel = label([0, 0], "P");
    map.append(ray, robot, p, pLabel);

    const head = el(
      "div",
      { class: "sim-head" },
      el("span", { class: "label" }, tr("demo.label")),
      el("strong", {}, tr("demo.frames.title")),
    );
    const view = el("div", { class: "demo-view" }, map);
    const legend = el(
      "p",
      { class: "demo-legend muted" },
      tr("demo.frames.legend"),
    );

    const deg = (v: number) => `${num(lang, v, 0)}°`;
    const metres = (v: number) => `${num(lang, v, 2)} ${m}`;
    const sliders: Slider[] = [];
    const robotSet = el(
      "fieldset",
      { class: "demo-set" },
      el("legend", {}, tr("demo.frames.robot")),
    );
    const seenSet = el(
      "fieldset",
      { class: "demo-set" },
      el("legend", {}, tr("demo.frames.seen")),
    );
    const add = (
      set: HTMLElement,
      label: string,
      min: number,
      max: number,
      step: number,
      value: number,
      format: (v: number) => string,
      apply: (v: number) => void,
    ) => {
      const s = slider({
        label,
        min,
        max,
        step,
        value,
        format,
        onInput: (v) => (apply(v), draw()),
      });
      sliders.push(s);
      set.append(s.row);
    };
    add(
      robotSet,
      tr("demo.frames.x"),
      0,
      5,
      0.05,
      pose.x,
      metres,
      (v) => (pose.x = v),
    );
    add(
      robotSet,
      tr("demo.frames.y"),
      0,
      2.8,
      0.05,
      pose.y,
      metres,
      (v) => (pose.y = v),
    );
    add(
      robotSet,
      tr("demo.frames.heading"),
      -180,
      180,
      1,
      toDegrees(pose.theta),
      deg,
      (v) => (pose.theta = toRadians(v)),
    );
    add(
      seenSet,
      tr("demo.frames.ahead"),
      -1,
      2.5,
      0.05,
      seen[0],
      metres,
      (v) => (seen[0] = v),
    );
    add(
      seenSet,
      tr("demo.frames.left"),
      -1.5,
      1.5,
      0.05,
      seen[1],
      metres,
      (v) => (seen[1] = v),
    );
    const controls = el("div", { class: "demo-controls" }, robotSet, seenSet);

    // Readouts: the heading both ways, P in both frames, the matrix.
    const out = {
      heading: el("dd"),
      robot: el("dd"),
      world: el("dd"),
    };
    const cells = [0, 1, 2, 3].map(() => el("span"));
    const matrix = el(
      "div",
      { class: "demo-matrix" },
      el("span", { class: "muted" }, `${tr("demo.frames.matrix")} =`),
      el("span", { class: "demo-brackets" }, ...cells),
    );
    const readouts = el(
      "dl",
      { class: "sim-readouts" },
      el("div", {}, el("dt", {}, tr("demo.frames.heading.value")), out.heading),
      el("div", {}, el("dt", {}, tr("demo.frames.inRobot")), out.robot),
      el("div", {}, el("dt", {}, tr("demo.frames.inWorld")), out.world),
    );

    const pair = (v: Vec2) =>
      `(${num(lang, v[0], 2)}, ${num(lang, v[1], 2)}) ${m}`;
    const draw = () => {
      robot.replaceChildren(
        ...arrow([pose.x, pose.y], toWorld([0.8, 0], pose), "robot-axis"),
        ...arrow([pose.x, pose.y], toWorld([0, 0.8], pose), "robot-axis"),
        svg("polygon", {
          points: [
            toWorld([0.28, 0], pose),
            toWorld([-0.18, 0.18], pose),
            toWorld([-0.18, -0.18], pose),
          ]
            .map(([x, y]) => `${x},${-y}`)
            .join(" "),
          class: "body",
        }),
        label(toWorld([1.02, 0], pose), "x"),
        label(toWorld([0, 1.02], pose), "y"),
      );
      const w = toWorld(seen, pose);
      ray.setAttribute("x1", String(pose.x));
      ray.setAttribute("y1", String(-pose.y));
      ray.setAttribute("x2", String(w[0]));
      ray.setAttribute("y2", String(-w[1]));
      p.setAttribute("cx", String(w[0]));
      p.setAttribute("cy", String(-w[1]));
      pLabel.setAttribute("x", String(w[0] + 0.13));
      pLabel.setAttribute("y", String(-w[1] - 0.1));
      out.heading.textContent = `${deg(toDegrees(pose.theta))} = ${num(lang, pose.theta, 2)} ${tr("demo.unit.rad")}`;
      out.robot.textContent = pair(seen);
      out.world.textContent = pair(w);
      const r = rotation(pose.theta);
      [r[0][0], r[0][1], r[1][0], r[1][1]].forEach(
        (v, i) => (cells[i]!.textContent = num(lang, v, 2)),
      );
    };
    draw();

    this.replaceChildren(
      el(
        "figure",
        {
          class: "sim-demo demo-2d",
          role: "group",
          "aria-label": tr("demo.frames.title"),
        },
        head,
        view,
        legend,
        controls,
        readouts,
        matrix,
      ),
    );
  }
}

/** A line with a small arrowhead, in world coordinates. */
function arrow(from: Vec2, to: Vec2, cls: string): SVGElement[] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  const s = 0.11;
  const base: Vec2 = [to[0] - ux * s, to[1] - uy * s];
  const head = [
    to,
    [base[0] - uy * s * 0.55, base[1] + ux * s * 0.55],
    [base[0] + uy * s * 0.55, base[1] - ux * s * 0.55],
  ] as Vec2[];
  return [
    svg("line", {
      x1: from[0],
      y1: -from[1],
      x2: base[0],
      y2: -base[1],
      class: cls,
    }),
    svg("polygon", {
      points: head.map(([x, y]) => `${x},${-y}`).join(" "),
      class: `${cls} head`,
    }),
  ];
}

function label(at: Vec2, text: string, cls = ""): SVGElement {
  const t = svg("text", { x: at[0], y: -at[1], class: `name ${cls}`.trim() });
  t.textContent = text;
  return t;
}

if (!customElements.get("frames-demo"))
  customElements.define("frames-demo", FramesDemo);
