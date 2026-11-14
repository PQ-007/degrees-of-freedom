---
title: "Time-of-flight sensor"
summary: "Times a pulse of invisible light to measure the distance to one spot."
figureAlt: "Line drawing of a time-of-flight sensor: a small board with a chip sending a beam of light to a wall and back."
---

- **Good for:** small, precise distance readings: edges, walls, gestures.
- **Not for:** seeing more than one spot at a time.
- **Typical:** a few metres, in a narrow cone.
- **Topic:** [[C10]]

Like an ultrasonic sensor, but with light: the chip sends a pulse of infrared laser light and times its return ([[~time-of-flight|time of flight]]). Light is fast and narrow, so it measures a small spot precisely.[@vl53l1x]

<aside class="examples" aria-label="Common models">

**Common models** · checked 15 November 2026

- **ST VL53L1X:** eye-safe laser pulses, up to 4 m with 1 mm resolution, up to 50 Hz, a 27° field of view, over I²C.[@vl53l1x]

</aside>
