---
title: "Smart bus servo"
summary: "A servo with a brain: many on one cable, each reporting back."
figureAlt: "Line drawing of two servos joined by one data cable that runs on to the next servo."
---

- **Good for:** small humanoids and arms with many joints.
- **Not for:** fast or very strong joints.
- **Typical:** many servos on one data cable, each reporting its position, load and temperature.
- **Topic:** [[C5]]

A servo with its own microcontroller. Many of them share one data cable, a [[~bus|bus]]: you send each one a target by its address, and it reports back what it is doing. That saves wiring and gives you feedback that a hobby servo can't.

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **ROBOTIS DYNAMIXEL XL430-W250-T:** stall torque 1.4 N·m at 11.1 V, gearing 258.5:1, 4,096 positions per turn, chained on a serial bus at up to 4.5 Mbps; reports its position, velocity, load, temperature and supply voltage; 57.2 g.[@dynamixel-xl430]

</aside>
