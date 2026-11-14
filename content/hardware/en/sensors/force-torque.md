---
title: "Force/torque sensor"
summary: "Feels the pushes and twists between a robot and what it holds."
figureAlt: "Line drawing of a force/torque sensor: a round sensor between two plates, one fixed to the robot and one to its tool, with arrows for push and twist."
---

- **Good for:** careful contact: assembly, polishing, surgery, hands.
- **Not for:** small budgets, or being overloaded.
- **Typical:** six readings: a push and a twist along each of three axes.
- **Topic:** [[C9]]

Inside, strain gauges stretch very slightly under load, and that changes their resistance. Several of them, placed around the sensor, together give three pushes and three twists. Mounted at a robot's wrist, it lets the arm feel what its tool is touching, which [[M8]] needs.

<aside class="examples" aria-label="Common models">

**Common models** · checked 15 November 2026

- **ATI Mini45:** six-axis, with silicon strain gauges whose signal ATI gives as 75 times stronger than foil gauges; one calibration reads up to 30 lbf sideways, 60 lbf along its axis and 40 lbf·in of twist; used in telerobotics, surgical robots and robot-hand research.[@ati-mini45]

</aside>
