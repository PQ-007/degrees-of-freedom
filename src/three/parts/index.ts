// Every part's 3D model, by its Hardware type key (src/three/part-keys.ts
// lists the same keys without loading Three.js; a unit test keeps them equal).
import type { PartRecipe } from "../kit";
import { COMPUTER_MODELS } from "./computers";
import { MOTOR_MODELS } from "./motors";
import { SENSOR_MODELS } from "./sensors";

export const PART_MODELS: Record<string, PartRecipe> = {
  ...MOTOR_MODELS,
  ...COMPUTER_MODELS,
  ...SENSOR_MODELS,
};
