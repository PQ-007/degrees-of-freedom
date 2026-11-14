---
title: "Hobby servo"
summary: "A motor, gears and a sensor in a box: point it to an angle."
figureAlt: "Line drawing of a hobby servo seen from above: a rectangular body with a mounting ear at each end, the round output spline near one end with a single-arm horn on it, and three wires leaving the other end."
---

- **Good for:** pointing something: small arms, grippers, steering, camera mounts.
- **Not for:** strong or precise joints, or telling you where it really is.
- **Typical:** commanded by a pulse 1 to 2 ms wide, sent every 20 ms; 1.5 ms means the middle.[@sparkfun-servo]
- **Topic:** [[C5]]

A [[~servo|servo]] packs a DC motor, gears, a potentiometer on the output shaft and a small control board into one box.[@sparkfun-servo] The width of each pulse says which angle to go to, and the board drives the motor until the potentiometer agrees. Cheap and easy, but weak, not very precise, and it tells you nothing back. A continuous-rotation servo uses the same signal to set its speed and direction instead of an angle.[@sparkfun-servo]
