// A differential-drive robot: pure, no DOM (tests/unit/diffdrive.test.ts).
//
// Two driven wheels on one axle, a track width W apart, with ground speeds
// vL and vR (casters keep it level). The point midway between the wheels
// moves forward at v and the body turns at ω,
//
//   v = (vR + vL) / 2,   ω = (vR − vL) / W,
//
// so it drives along a circle of radius R = v / ω round a point on the
// axle's line: straight on when the speeds are equal, spinning in place
// when they are opposite, pivoting about one wheel when that wheel stops.
// Constant speeds give an exact arc, so the path needs no time steps.

export interface Pose {
  x: number;
  y: number;
  /** Heading, rad, anticlockwise from the x axis. */
  heading: number;
}

export function body(vL: number, vR: number, W: number) {
  return { v: (vR + vL) / 2, omega: (vR - vL) / W };
}

/** The turning radius (m, + to the left): Infinity when driving straight. */
export function radius(vL: number, vR: number, W: number): number {
  const { v, omega } = body(vL, vR, W);
  return Math.abs(omega) < 1e-12 ? Infinity : v / omega;
}

/** Where the robot is after t seconds at constant wheel speeds. */
export function poseAt(
  start: Pose,
  vL: number,
  vR: number,
  W: number,
  t: number,
): Pose {
  const { v, omega } = body(vL, vR, W);
  const h = start.heading;
  if (Math.abs(omega) < 1e-12)
    return {
      x: start.x + v * t * Math.cos(h),
      y: start.y + v * t * Math.sin(h),
      heading: h,
    };
  const R = v / omega;
  const h2 = h + omega * t;
  return {
    x: start.x + R * (Math.sin(h2) - Math.sin(h)),
    y: start.y - R * (Math.cos(h2) - Math.cos(h)),
    heading: h2,
  };
}

/** The point a wheel touches the ground, for a pose: side +1 left, −1 right. */
export function wheelAt(p: Pose, W: number, side: 1 | -1) {
  return {
    x: p.x - side * (W / 2) * Math.sin(p.heading),
    y: p.y + side * (W / 2) * Math.cos(p.heading),
  };
}

/** The path over t seconds as n + 1 poses. */
export function path(
  start: Pose,
  vL: number,
  vR: number,
  W: number,
  t: number,
  n = 120,
): Pose[] {
  return Array.from({ length: n + 1 }, (_, i) =>
    poseAt(start, vL, vR, W, (t * i) / n),
  );
}
