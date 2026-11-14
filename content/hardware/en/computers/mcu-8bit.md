---
title: "8-bit microcontroller board"
summary: "One small chip, one program: read, decide, drive. The classic first board."
figureAlt: "Line drawing of a small microcontroller board seen from above: a long chip with rows of legs, rows of pin headers along the edges, a USB socket, a power socket and a small LED."
---

- **Good for:** learning, and simple robots with a few sensors and motors.
- **Not for:** cameras, heavy maths, or many tasks at once.
- **Typical:** a few kilobytes of memory and a clock of tens of megahertz.
- **Topic:** [[C11]]

A [[~microcontroller|microcontroller]] runs one program straight on the chip, with no operating system in between, so it does exactly what you wrote, when you wrote it. Its pins read switches and sensors and switch [[~motor-driver|motor drivers]]. Small and slow by today's standards, but plenty for a line follower.

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **Arduino UNO R3:** an ATmega328P at 16 MHz, with 32 kB of flash, 2 kB of SRAM and 1 kB of EEPROM; 14 digital pins (6 of them PWM) and 6 analog inputs.[@arduino-uno-r3]

</aside>
