---
title: "Motors and actuators"
summary: "The parts that make a robot move."
---

Start from the job the joint has to do, not from the motor:

- **It only has to point somewhere, and it's small and cheap?** A hobby servo, or a smart bus servo if you want to read its position back and chain many on one cable.
- **It has to drive a wheel?** A brushed gearmotor for a small robot; a brushless motor with a gearbox when it needs to be efficient or strong.
- **It has to move to exact positions, slowly, with a light load?** A stepper motor, if you can accept that it doesn't know when it has slipped.
- **It has to be stiff and precise, like a factory arm?** A harmonic-drive joint.
- **It hits the ground or touches people, and has to feel force?** A quasi-direct-drive actuator or a series elastic actuator: both can be pushed back, and both can sense force.
- **It needs huge force from a small part, and you can carry a pump?** Hydraulics.
- **It only needs to open and close, fast, like a gripper?** Pneumatics.

The [[~gear-ratio|gear ratio]] is the trade at the heart of most of these choices: more gearing gives more torque and precision, but less speed and less backdrivability. [[C2|Transmissions]] explains why.
