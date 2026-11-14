---
title: "Depth camera"
summary: "An image where every pixel also knows how far away it is."
figureAlt: "Line drawing of a depth camera: a long bar with two lenses at its ends and a projector between them, casting a pattern of dots ahead."
---

- **Good for:** grasping, 3D maps, avoiding obstacles at any height.
- **Not for:** plain or shiny surfaces with nothing to match, or long distances.
- **Typical:** a distance for every pixel, out to a few metres.
- **Topic:** [[P7]]

A stereo depth camera has two cameras a short distance apart, like eyes. The nearer something is, the more its position differs between the two images, and matching the two gives a distance for every pixel ([[P7]]). Some project a pattern of dots to give plain surfaces something to match.

<aside class="examples" aria-label="Common models">

**Common models** · checked 15 November 2026

- **RealSense D435i:** stereo depth with global-shutter sensors, best from 0.3 to 3 m, an 87° × 58° view, depth up to 1280 × 720 at up to 90 frames a second; with an IMU and a colour camera, over USB-C.[@realsense-d435i]

</aside>
