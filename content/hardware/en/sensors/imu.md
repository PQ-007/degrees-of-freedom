---
title: "IMU"
summary: "A tiny chip that feels turning and acceleration: which way is down, and how it's moving."
figureAlt: "Line drawing of an IMU chip with three arrows from one corner, for its three axes, tilting as if the robot moved."
---

- **Good for:** balance, tilt, and turning rate; drones and walking robots.
- **Not for:** position on its own: added-up readings drift.
- **Typical:** a gyroscope and an accelerometer on three axes each, in one chip.
- **Topic:** [[C9]]

An [[~imu|IMU]] holds a gyroscope, which measures how fast it turns, and an accelerometer, which measures acceleration and so the pull of gravity, which way is down. Adding up the turning rate gives the heading, but every small error is added up too, so it drifts ([[~integral|integral]]); robots correct it with other sensors ([[P4]]).

<aside class="examples" aria-label="Common models">

**Common models** · checked 15 November 2026

- **TDK InvenSense ICM-42688-P:** 6 axes, gyroscope up to ±2000 °/s, accelerometer up to ±16 g, I3C, I²C and SPI.[@icm-42688] It is one of the IMUs in the Pixhawk 6C flight controller.[@pixhawk-6c]

</aside>
