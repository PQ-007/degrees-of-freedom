// R5 Planetary rover in 3D (the user, 2026-11-16: 3D on the dedicated
// pages). An original, generic six-wheeled rover, matching the line drawing
// content/robots/planetary-rover.svg and its numbered callouts
// (content/robots/planetary-rover.yaml): 1 mast cameras, 2 hazard cameras,
// 3 the warm body holding the computers, 4 wheels on a rocker-bogie,
// 5 the arm with its tool turret, 6 the power source, 7 the antennas.
// Front is +x, up is +y. The wheels turn and the mast head looks about.
import { Group, type Object3D } from "three";
import {
  at,
  box,
  cyl,
  group,
  part,
  plate,
  strut,
  swing,
  type Materials,
  type PartRecipe,
} from "../kit";

const TAU = Math.PI * 2;
type Vec = [number, number, number];

/** A wheel along z: tyre, grousers, hub. */
function wheel(m: Materials): Group {
  const tyre = part(cyl(0.22, 0.2), "body", m);
  tyre.rotation.x = Math.PI / 2;
  const g = group(tyre);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    g.add(
      at(
        part(box(0.03, 0.035, 0.2), "dark", m, 60),
        0.225 * Math.cos(a),
        0.225 * Math.sin(a),
        0,
        0,
        0,
        a,
      ),
    );
  }
  g.add(at(part(cyl(0.07, 0.24, 20), "dark", m), 0, 0, 0, Math.PI / 2, 0, 0));
  return g;
}

export const planetaryRover: PartRecipe = (m) => {
  // 3: the warm body, which holds the computers.
  const body = at(part(box(1.6, 0.42, 1.0), "body", m), 0, 0.78, 0);
  const deck = at(part(box(1.5, 0.04, 0.92), "pale", m), 0, 1.01, 0);
  const computers = [body, deck];

  // 4: six wheels on a rocker-bogie each side.
  const wheels: Group[] = [];
  const suspension: Object3D[] = [];
  for (const side of [-1, 1]) {
    const z = side * 0.62;
    const zw = side * 0.74;
    const pivot: Vec = [0.15, 0.66, z];
    const bogie: Vec = [-0.38, 0.46, z];
    const front: Vec = [0.78, 0.22, zw];
    const mid: Vec = [0.0, 0.22, zw];
    const rear: Vec = [-0.76, 0.22, zw];
    // The linkage runs in the plane z; each wheel hangs just outside it.
    const inPlane = (p: Vec): Vec => [p[0], p[1], z];
    suspension.push(
      strut(pivot, inPlane(front), 0.04, "dark", m),
      strut(pivot, bogie, 0.04, "dark", m),
      strut(bogie, inPlane(mid), 0.035, "dark", m),
      strut(bogie, inPlane(rear), 0.035, "dark", m),
      at(
        part(cyl(0.06, 0.1, 20), "pale", m),
        pivot[0],
        pivot[1],
        z,
        Math.PI / 2,
        0,
        0,
      ),
      at(
        part(cyl(0.05, 0.1, 20), "pale", m),
        bogie[0],
        bogie[1],
        z,
        Math.PI / 2,
        0,
        0,
      ),
    );
    for (const h of [front, mid, rear]) {
      suspension.push(strut(inPlane(h), h, 0.03, "dark", m));
      wheels.push(at(wheel(m), h[0], h[1], h[2]));
    }
  }

  // 1: the mast, with its camera head.
  const mastPole = at(part(cyl(0.045, 0.75, 20), "dark", m), 0.55, 1.4, 0.32);
  const head = group(
    part(box(0.2, 0.16, 0.42), "body", m),
    at(
      part(cyl(0.05, 0.06, 20), "dark", m),
      0.12,
      0.02,
      -0.11,
      0,
      0,
      Math.PI / 2,
    ),
    at(
      part(cyl(0.05, 0.06, 20), "dark", m),
      0.12,
      0.02,
      0.11,
      0,
      0,
      Math.PI / 2,
    ),
    at(
      part(cyl(0.035, 0.05, 16), "dark", m),
      0.12,
      -0.04,
      0,
      0,
      0,
      Math.PI / 2,
    ),
  );
  at(head, 0.57, 1.83, 0.32);
  const mast = [mastPole, head];

  // 2: hazard cameras, low on the front and back.
  const hazcam = (x: number, z: number, face: number) =>
    group(
      at(part(box(0.08, 0.08, 0.1), "dark", m), 0, 0, 0),
      at(
        part(cyl(0.025, 0.03, 12), "pale", m),
        face * 0.05,
        0,
        0,
        0,
        0,
        Math.PI / 2,
      ),
    )
      .translateX(x)
      .translateY(0.6)
      .translateZ(z);
  const hazcams = [
    hazcam(0.84, -0.2, 1),
    hazcam(0.84, 0.2, 1),
    hazcam(-0.84, -0.2, -1),
    hazcam(-0.84, 0.2, -1),
  ];

  // 5: the arm, folded in front of the body, with its tool turret.
  const shoulder: Vec = [0.82, 0.86, -0.36];
  const elbow: Vec = [1.2, 0.95, -0.1];
  const wrist: Vec = [0.98, 0.62, 0.2];
  const turret = group(
    part(cyl(0.12, 0.12, 24), "body", m),
    at(part(cyl(0.03, 0.14, 12), "dark", m), 0.1, -0.1, 0),
    at(part(box(0.06, 0.12, 0.06), "dark", m), -0.1, -0.08, 0),
    at(part(cyl(0.04, 0.1, 12), "dark", m), 0, -0.09, 0.1),
  );
  at(turret, wrist[0], wrist[1] - 0.1, wrist[2]);
  const arm = [
    at(
      part(cyl(0.07, 0.1, 20), "pale", m),
      shoulder[0],
      shoulder[1],
      shoulder[2],
      Math.PI / 2,
      0,
      0,
    ),
    strut(shoulder, elbow, 0.045, "body", m),
    strut(elbow, wrist, 0.04, "body", m),
    turret,
  ];

  // 6: the power source at the back, a finned cylinder.
  const finned = group(part(cyl(0.16, 0.55), "body", m));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    finned.add(
      at(
        part(box(0.02, 0.5, 0.12), "pale", m),
        0.2 * Math.cos(a),
        0,
        0.2 * Math.sin(a),
        0,
        -a,
        0,
      ),
    );
  }
  at(finned, -1.02, 0.95, 0, 0, 0, -0.9);
  const power = [finned];

  // 7: antennas: a flat high-gain panel on a gimbal and a low-gain post.
  const hga = group(
    at(part(cyl(0.035, 0.18, 12), "dark", m), 0, -0.09, 0),
    at(
      part(
        plate(
          [
            [-0.22, -0.2],
            [0.22, -0.2],
            [0.26, 0],
            [0.22, 0.2],
            [-0.22, 0.2],
            [-0.26, 0],
          ],
          0.04,
        ),
        "body",
        m,
      ),
      0,
      0.06,
      0,
      0.25,
      0,
      0,
    ),
  );
  at(hga, -0.45, 1.12, -0.32);
  const lga = group(
    at(part(cyl(0.025, 0.32, 12), "dark", m), 0, 0, 0),
    at(part(cyl(0.05, 0.05, 16), "body", m), 0, 0.18, 0),
  );
  at(lga, -0.2, 1.18, 0.34);
  const antennas = [hga, lga];

  const root = group(
    ...computers,
    ...suspension,
    ...wheels,
    ...mast,
    ...hazcams,
    ...arm,
    ...power,
    ...antennas,
  );
  return {
    root,
    pose: (t) => {
      for (const w of wheels) w.rotation.z = -t * 1.2;
      head.rotation.y = 0.6 * swing(t, 6);
    },
    view: [0.75, 0.45, 1],
    callouts: [
      { n: 1, anchor: [0.57, 2.05, 0.32], parts: mast },
      { n: 2, anchor: [0.95, 0.45, 0.2], parts: hazcams },
      { n: 3, anchor: [0, 1.15, 0.5], parts: computers },
      { n: 4, anchor: [-0.76, -0.12, 0.74], parts: [...wheels, ...suspension] },
      { n: 5, anchor: [1.3, 1.05, -0.1], parts: arm },
      { n: 6, anchor: [-1.3, 1.25, 0], parts: power },
      { n: 7, anchor: [-0.45, 1.45, -0.32], parts: antennas },
    ],
  };
};

export const ROBOT_MODELS: Record<string, PartRecipe> = {
  "planetary-rover": planetaryRover,
};
