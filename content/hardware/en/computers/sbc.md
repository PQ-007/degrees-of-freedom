---
title: "Single-board computer"
summary: "A whole computer on one card-sized board: Linux, cameras, networks."
figureAlt: "Line drawing of a single-board computer seen from above: a card-sized board with a processor, a memory chip, a double row of pins along one edge, stacked USB and network sockets on another, mounting holes and an LED."
---

- **Good for:** cameras, maps, planning, ROS, and talking to people and other machines.
- **Not for:** the fastest motor loops on its own.
- **Typical:** several processor cores at gigahertz speeds and gigabytes of memory.
- **Topic:** [[C11]]

A [[~single-board-computer|single-board computer]] runs a full operating system, usually Linux, so it can run ROS ([[S2]]), handle cameras and talk over the network. The operating system shares the processor between many programs, though, so an urgent task can wait; Linux's real-time configuration, PREEMPT_RT, shortens that wait.[@linux-preempt-rt] That's why it is often paired with a microcontroller beside the motors.

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **Raspberry Pi 5:** a quad-core 64-bit Arm Cortex-A76 at 2.4 GHz, 1 to 16 GB of RAM, two USB 3.0 ports, Gigabit Ethernet, a PCIe 2.0 lane and the standard 40-pin header; powered with 5 V, 5 A over USB-C.[@raspberry-pi-5]

</aside>
