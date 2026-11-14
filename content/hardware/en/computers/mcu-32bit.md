---
title: "32-bit microcontroller board"
summary: "Far more speed and memory, still one program with exact timing."
figureAlt: "Line drawing of a long, narrow microcontroller board seen from above: a square chip in the middle, a smaller memory chip, a USB socket at one end, a button, an LED and a row of pin pads along each long edge."
---

- **Good for:** keeping several motors in time, many sensors, a small robot's main controller.
- **Not for:** running Linux, cameras and neural networks.
- **Typical:** hundreds of kilobytes of memory and a clock over 100 MHz.
- **Topic:** [[C11]]

The same idea as an 8-bit board, with far more speed and memory: enough to run [[~control-loop|control loops]] for several motors and talk to sensors over [[~bus|buses]]. When the jobs pile up, it can run a small [[~real-time|real-time]] operating system that shares the chip between tasks without losing their timing ([[L2]]).

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **Raspberry Pi Pico 2:** an RP2350 with two Arm Cortex-M33 or two Hazard3 RISC-V cores at 150 MHz, 520 KB of SRAM, 4 MB of flash and 12 PIO state machines for custom timing; from $5.[@pico-2]

</aside>
