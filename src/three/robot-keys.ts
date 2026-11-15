// The robot teardowns that have a 3D model (src/three/robots), without
// loading Three.js: pages use it to decide whether to show the 3D viewer.
export const ROBOT_MODEL_KEYS: ReadonlySet<string> = new Set([
  "planetary-rover",
]);
