---
title: "Brushed DC gearmotor"
summary: "A small motor with its own gearbox: the go-to for wheels."
figureAlt: "Line drawing of a small cylindrical motor with a gearbox block on its front, an output shaft, and two wires at the back."
---

- **Good for:** wheels and simple joints on small robots.
- **Not for:** knowing where it is without an added sensor, or joints you need to push back by hand.
- **Typical:** a small motor and gearbox in one, running on a few volts.
- **Topic:** [[C4]]

The simplest choice. A DC motor runs faster with more voltage and pushes harder with more current, and a small gearbox trades its speed for [[~torque|torque]]. On its own it doesn't know where it is; add an [[~encoder|encoder]] to [[~control-loop|close the loop]]. A [[~motor-driver|motor driver]] sets its voltage and direction. Worm gears lock in place when the power is off, which helps hold a load but means the joint can't be pushed back.

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **Pololu Micro Metal Gearmotors:** brushed gearmotors with a 10 × 12 mm gearbox, in ratios from 5:1 to 1000:1, for 6 V or 12 V; versions with a rear shaft take an encoder.[@pololu-micro-gearmotor]

</aside>
