---
title: "2D lidar"
summary: "A spinning laser that measures distances all the way round."
figureAlt: "Line drawing of a 2D lidar: a round spinning head on a square base, with a laser beam reaching out from its window."
---

- **Good for:** mapping rooms and finding a robot's place in them.
- **Not for:** glass and mirrors, or things above or below its plane.
- **Typical:** thousands of distances a second, around a full circle.
- **Topic:** [[C10]]

A [[~lidar|lidar]] spins a laser rangefinder and measures the distance in every direction around it, many times a second. Each turn draws the outline of the room at its own height, which is what mapping and localization need ([[P8]], [[P9]]).

<aside class="examples" aria-label="Common models">

**Common models** · checked 15 November 2026

- **Slamtec RPLIDAR A1:** 360-degree scanning by laser triangulation, more than 8000 measurements a second, at 2 to 10 turns a second; made for SLAM.[@rplidar-a1]

</aside>
