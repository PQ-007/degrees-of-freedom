---
title: "Sensors"
summary: "How a robot feels itself and sees the world."
---

Start from what the robot needs to know:

- **How far a motor or wheel has turned?** An encoder.
- **Which way is down, and how fast it is turning?** An IMU.
- **Is something close ahead?** An ultrasonic or time-of-flight sensor.
- **The shape of the room around it?** A 2D lidar.
- **What things are?** A camera.
- **Where things are in 3D, close up?** A depth camera.
- **How hard it is pushing on something?** A force/torque sensor.

Most robots combine several: each one covers for another's weak spots ([[P4]]). Every [[~sensor|sensor]] has some [[~noise|noise]].
