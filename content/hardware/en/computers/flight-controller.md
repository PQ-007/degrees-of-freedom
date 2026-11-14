---
title: "Flight controller"
summary: "A microcontroller board with motion sensors on it, made to fly drones."
figureAlt: "Line drawing of a flight controller seen from above: a rounded box with an arrow on top showing which way is forward, and connectors along its sides."
---

- **Good for:** drones, and also rovers and boats.
- **Not for:** heavy computing such as vision.
- **Typical:** a fast 32-bit microcontroller with several motion sensors built in.
- **Topic:** [[M11]]

A flight controller reads its own [[~imu|IMUs]], barometer and compass, works out how the vehicle is tilted and moving, and sets each motor's speed to keep it steady, many times a second. Open flight software such as PX4 runs on it. The arrow on top shows which way it must face.

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **Holybro Pixhawk 6C:** an STM32H743 (Arm Cortex-M7, 480 MHz, 2 MB of flash, 1 MB of SRAM) with an STM32F103 for input and output, two IMUs, a barometer and a magnetometer; supported by PX4.[@pixhawk-6c]

</aside>
