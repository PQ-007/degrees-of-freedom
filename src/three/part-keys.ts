// The Hardware types that have a 3D model (src/three/parts), without loading
// Three.js: pages use it to decide whether to show the 3D viewer.
export const PART_MODEL_KEYS: ReadonlySet<string> = new Set([
  "gearmotor",
  "hobby-servo",
  "bus-servo",
  "stepper",
  "bldc-gearbox",
  "qdd",
  "harmonic",
  "sea",
  "hydraulic",
  "pneumatic",
  "mcu-8bit",
  "mcu-32bit",
  "mcu-wireless",
  "flight-controller",
  "sbc",
  "ai-computer",
]);
