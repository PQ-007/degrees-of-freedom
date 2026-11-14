---
title: "Stepper motor"
summary: "Moves one exact step per pulse: the 3D printer's motor."
figureAlt: "Line drawing of a square stepper motor seen from the front, with four mounting holes, a round boss, the shaft, and tick marks around it for its steps."
---

- **Good for:** 3D printers and light machines that repeat exact moves.
- **Not for:** unknown or heavy loads, or high speed.
- **Typical:** 200 steps per turn, 1.8° each, on common motors.[@pololu-nema17]
- **Topic:** [[C4]]

A [[~stepper-motor|stepper]] moves one fixed step for each pulse it is sent, so a controller can count pulses to know where it is without a sensor. That works until the load is more than the motor can push: then it can skip steps, and nothing notices.[@stepper-lost-steps] Its torque also falls as it speeds up.

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **NEMA 17 steppers,** named for their frame size. Pololu's item 2267, for example: 42.3 mm square, 1.8° steps, 1.7 A per phase at 2.8 V, holding torque 3.7 kg·cm, 285 g.[@pololu-nema17]

</aside>
