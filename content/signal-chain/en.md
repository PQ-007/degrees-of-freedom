---
title: "Signal chain"
summary: "Follow one moment of a robot's life: from something in the world, through the robot, and back out into the world."
---

## Loops inside loops {#loops}

A real robot doesn't run the chain once. It runs many copies of it at once, nested inside each other, each one faster than the one around it:

| Loop | What it keeps right | Where it usually runs |
|---|---|---|
| Current | The current in each motor's coils | The motor driver |
| Speed and position | Each wheel's speed, each joint's angle | The motor controller |
| Balance or driving | The whole robot's motion | The main computer |
| Planning | The path ahead | The main computer |
| Mission | What to do today | The main computer, or people |

The order matters more than the exact speeds: each loop has to settle much faster than the loop outside it, so that the outer loop can treat it as if it simply did what it was told. [[S1]] shows how the layers are arranged in software, and [[L2]] why the fast ones need a real-time system.

## A rover, end to end {#rover}

Follow one stretch of driving on a planetary rover:

1. **Sense.** Encoders count each wheel's turns, an IMU feels the body tilt and turn, and hazard cameras photograph the ground ahead.[@perseverance-components]
2. **Think.** The rover combines wheel turns, the IMU and camera images into its best estimate of where it is, finds rocks and slopes in the images, and picks a path between them to the next point it was told to reach.
3. **Act.** For each wheel it sends a speed to that wheel's motor controller, which switches the motor's current to hold that speed; the gears turn the wheel, and the rover moves a little. Then it looks again.

Around all of this sits the slowest loop of all: people on Earth review what the rover did, plan the next day, and send the commands, which arrive each Martian morning.[@perseverance-telecom] The signals take minutes each way, so nobody can steer it live; the fast loops have to run on the rover itself.[@perseverance-ai-drive] The [[I5]] and [[S6]] topics go further.

## Where it breaks {#breaks}

- **Latency.** Each stage adds a delay. Add enough of them inside a fast loop and the controller reacts to the past, and starts to oscillate ([[M5]]).
- **Noise.** Every sensor is noisy; filtering helps, but filters add delay too ([[L5]]).
- **Saturation.** A motor can only push so hard. Ask for more and the loop stops behaving the way it was designed to ([[M5]]).
- **A busy bus.** If too many messages share one wire, commands arrive late or not at all ([[L6]]).
- **Clocks out of step.** Measurements taken at different times, combined as if they were simultaneous, give a wrong estimate ([[P4]]).
- **Electrical trouble.** Ground loops and motor noise can corrupt sensor signals before they are ever digitised ([[C8]]).
