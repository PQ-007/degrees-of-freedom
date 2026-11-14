---
title: "Ultrasonic distance sensor"
summary: "Chirps and listens for the echo, like a bat."
figureAlt: "Line drawing of an ultrasonic distance sensor: a small board with two round transducers side by side, and sound waves spreading out from one."
---

- **Good for:** cheap obstacle detection on small robots.
- **Not for:** soft or slanted surfaces that don't echo back, or fine detail.
- **Typical:** a few centimetres to a few metres, in a wide cone.
- **Topic:** [[C10]]

It sends a short burst of sound too high to hear and times the echo: the distance is the echo time multiplied by the speed of sound, halved for the trip there and back ([[~time-of-flight|time of flight]]).[@hc-sr04] The sound spreads in a cone, so it finds the nearest thing ahead, but not exactly where it is.

<aside class="examples" aria-label="Common models">

**Common models** · checked 15 November 2026

- **HC-SR04:** eight 40 kHz pulses per reading; 2 cm to 4 m over a 15° angle; runs on 5 V.[@hc-sr04]

</aside>
