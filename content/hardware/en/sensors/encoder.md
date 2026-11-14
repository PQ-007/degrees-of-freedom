---
title: "Encoder"
summary: "Counts how far a shaft has turned: the motor's own sense of position."
figureAlt: "Line drawing of an encoder: a slotted disc on a shaft, and a fork-shaped sensor straddling its rim to count the slots as they pass."
---

- **Good for:** a motor's speed and angle, and wheel odometry.
- **Not for:** knowing where the robot is when wheels slip.
- **Typical:** tens to thousands of counts per turn, on two channels.
- **Topic:** [[C9]]

An [[~encoder|encoder]] turns rotation into pulses: slots in a disc pass a light, or magnets pass a sensor. Two channels slightly out of step, called quadrature, tell which way it is turning. Count the pulses and you know the angle; count them per second and you know the speed, which closes a motor's [[~control-loop|control loop]].

<aside class="examples" aria-label="Common models">

**Common models** · checked 15 November 2026

- **Pololu magnetic encoder kit** for micro metal gearmotors: Hall effect sensors read a 6-pole magnetic disc on the motor's back shaft, giving 12 counts per motor turn on two quadrature outputs; 2.7 to 18 V.[@pololu-encoder]

</aside>
