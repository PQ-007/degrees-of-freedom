---
title: "AI computer"
summary: "A small computer with a GPU, to run neural networks on the robot."
figureAlt: "Line drawing of an AI computer: a module with a finned heatsink and a round fan on top, sitting on a carrier board with sockets along its front."
---

- **Good for:** running neural networks on camera images, on the robot itself.
- **Not for:** tight budgets of power, weight or money.
- **Typical:** a graphics processor (GPU) beside the main processor, and a fan.
- **Topic:** [[C11]]

Neural networks come down to a huge number of multiplications, and a GPU works on many of them at once. With one on board, a robot can recognise objects in its camera images without sending them away ([[P6]]). It draws far more power than a microcontroller and needs cooling.

<aside class="examples" aria-label="Common models">

**Common models** · checked 14 November 2026

- **NVIDIA Jetson Orin Nano Super Developer Kit:** a 6-core Arm Cortex-A78AE CPU, an Ampere GPU with 1,024 CUDA cores and 32 Tensor Cores, 8 GB of memory and up to 67 INT8 TOPS, at 7 to 25 W.[@jetson-orin-nano]

</aside>
