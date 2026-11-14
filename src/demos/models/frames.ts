// Coordinate frames in the plane: pure, no DOM (tests/unit/frames.test.ts).
//
// A robot's pose in the world is its position (x, y) and heading θ. A point
// the robot's sensor sees is given in the robot's frame (forward, left); to
// put it on the world's map, rotate it by θ and add the robot's position:
//
//   p_world = R(θ) · p_robot + t,   R(θ) = [[cos θ, −sin θ], [sin θ, cos θ]]
//
// and back again with the transpose (a rotation's inverse):
//
//   p_robot = R(θ)ᵀ · (p_world − t)

export type Vec2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

export interface Pose {
  x: number;
  y: number;
  /** Heading, radians, anticlockwise from the world's x axis. */
  theta: number;
}

export const toRadians = (deg: number) => (deg * Math.PI) / 180;
export const toDegrees = (rad: number) => (rad * 180) / Math.PI;

export function rotation(theta: number): Mat2 {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [
    [c, -s],
    [s, c],
  ];
}

export function mul(m: Mat2, v: Vec2): Vec2 {
  return [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
}

export function transpose(m: Mat2): Mat2 {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ];
}

/** A point in the robot's frame, put in the world's frame. */
export function toWorld(p: Vec2, pose: Pose): Vec2 {
  const r = mul(rotation(pose.theta), p);
  return [r[0] + pose.x, r[1] + pose.y];
}

/** A point in the world's frame, seen from the robot. */
export function toRobot(p: Vec2, pose: Pose): Vec2 {
  return mul(transpose(rotation(pose.theta)), [p[0] - pose.x, p[1] - pose.y]);
}
