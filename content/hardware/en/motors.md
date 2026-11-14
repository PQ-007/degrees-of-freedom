---
title: "Motors and actuators"
summary: "The parts that make a robot move: how each kind works, what it's good and bad for, and common models."
---

An [[~actuator|actuator]] turns energy into motion. Most robots use electric motors, usually behind a gearbox; some use oil or air under pressure. Below is each common kind: what it's good for, what it isn't, how it works and a few real models. [[C4]], [[C5]] and [[C6]] explain the principles; "Which one?" at the end helps you choose, and the table after it puts all ten side by side.

## Brushed DC gearmotor {#gearmotor}

- **Good for:** wheels and simple joints on small robots.
- **Not for:** knowing where it is without an added sensor, or joints you need to push back by hand.
- **Typical:** a small motor and gearbox in one, running on a few volts.
- **Topic:** [[C4]]

The simplest choice. A DC motor runs faster with more voltage and pushes harder with more current, and a small gearbox trades its speed for [[~torque|torque]]. On its own it doesn't know where it is; add an [[~encoder|encoder]] to [[~control-loop|close the loop]]. A [[~motor-driver|motor driver]] sets its voltage and direction. Worm gears lock in place when the power is off, which helps hold a load but means the joint can't be pushed back.

<aside class="examples" aria-label="Common models: Brushed DC gearmotor">

**Common models** · checked 14 November 2026

- **Pololu Micro Metal Gearmotors:** brushed gearmotors with a 10 × 12 mm gearbox, in ratios from 5:1 to 1000:1, for 6 V or 12 V; versions with a rear shaft take an encoder.[@pololu-micro-gearmotor]

</aside>

## Hobby servo {#hobby-servo}

- **Good for:** pointing something: small arms, grippers, steering, camera mounts.
- **Not for:** strong or precise joints, or telling you where it really is.
- **Typical:** commanded by a pulse 1 to 2 ms wide, sent every 20 ms; 1.5 ms means the middle.[@sparkfun-servo]
- **Topic:** [[C5]]

A [[~servo|servo]] packs a DC motor, gears, a potentiometer on the output shaft and a small control board into one box.[@sparkfun-servo] The width of each pulse says which angle to go to, and the board drives the motor until the potentiometer agrees. Cheap and easy, but weak, not very precise, and it tells you nothing back. A continuous-rotation servo uses the same signal to set its speed and direction instead of an angle.[@sparkfun-servo]

## Smart bus servo {#bus-servo}

- **Good for:** small humanoids and arms with many joints.
- **Not for:** fast or very strong joints.
- **Typical:** many servos on one data cable, each reporting its position, load and temperature.
- **Topic:** [[C5]]

A servo with its own microcontroller. Many of them share one data cable, a [[~bus|bus]]: you send each one a target by its address, and it reports back what it is doing. That saves wiring and gives you feedback that a hobby servo can't.

<aside class="examples" aria-label="Common models: Smart bus servo">

**Common models** · checked 14 November 2026

- **ROBOTIS DYNAMIXEL XL430-W250-T:** stall torque 1.4 N·m at 11.1 V, gearing 258.5:1, 4,096 positions per turn, chained on a serial bus at up to 4.5 Mbps; reports its position, velocity, load, temperature and supply voltage; 57.2 g.[@dynamixel-xl430]

</aside>

## Stepper motor {#stepper}

- **Good for:** 3D printers and light machines that repeat exact moves.
- **Not for:** unknown or heavy loads, or high speed.
- **Typical:** 200 steps per turn, 1.8° each, on common motors.[@pololu-nema17]
- **Topic:** [[C4]]

A [[~stepper-motor|stepper]] moves one fixed step for each pulse it is sent, so a controller can count pulses to know where it is without a sensor. That works until the load is more than the motor can push: then it can skip steps, and nothing notices.[@stepper-lost-steps] Its torque also falls as it speeds up.

<aside class="examples" aria-label="Common models: Stepper motor">

**Common models** · checked 14 November 2026

- **NEMA 17 steppers,** named for their frame size. Pololu's item 2267, for example: 42.3 mm square, 1.8° steps, 1.7 A per phase at 2.8 V, holding torque 3.7 kg·cm, 285 g.[@pololu-nema17]

</aside>

## Brushless motor + gearbox {#bldc-gearbox}

- **Good for:** the wheels of mobile robots, robot arms, anything that works long and hard.
- **Not for:** the simplest projects: it needs a driver that switches its coils.
- **Typical:** efficient and powerful for its size, often with a planetary gearbox.
- **Topic:** [[C4]]

A [[~brushless-motor|brushless motor]] has no brushes to wear out; instead, its [[~motor-driver|driver]] switches the current between its coils in the right order, usually with feedback from a sensor ([[L3]]). Paired with a gearbox, it is the workhorse of mobile robots and many robot arms.

## Quasi-direct drive (QDD) {#qdd}

- **Good for:** legs that hit the ground, and joints that must feel force.
- **Not for:** joints that need a lot of torque from a small, light motor.
- **Typical:** a large, flat brushless motor with very little gearing.
- **Topic:** [[C5]]

With so little gearing, a [[~quasi-direct-drive|QDD]] joint is [[~backdrivable|backdrivable]], survives hard impacts, and can sense force from the motor's current alone, without a separate force sensor. The MIT Cheetah's legs were built this way.[@qdd-cheetah]

<aside class="examples" aria-label="Common models: Quasi-direct drive (QDD)">

**Common models** · checked 14 November 2026

- **CubeMars AK80-9:** a 10:1 reduction, rated up to 8.3 N·m and peak up to 24.8 N·m, 621 g; made for quadruped robots, exoskeletons and collaborative arms.[@cubemars-ak80]

</aside>

## Harmonic-drive joint {#harmonic}

- **Good for:** stiff, precise joints, such as those of robot arms.
- **Not for:** joints that should give way when pushed, or tight budgets.
- **Typical:** a large reduction in one compact stage, with almost no [[~backlash|backlash]].
- **Topic:** [[C2]]

A strain-wave gear has three parts: a wave generator, a flexible toothed ring called the flexspline, and a rigid circular spline. Its teeth stay engaged under a permanent preload, so it packs a large reduction into one stage with almost no backlash.[@harmonic-drive] The price is cost, and a joint that can hardly be pushed back.

## Series elastic actuator (SEA) {#sea}

- **Good for:** measuring and controlling force, and joints that work near people.
- **Not for:** fast, stiff position control.
- **Typical:** a spring between the gearbox and the load.
- **Topic:** [[C5]]

A [[~series-elastic-actuator|series elastic actuator]] puts a spring there on purpose. Measuring how far the spring stretches tells you the force, which makes force control easier, and the spring protects the gears from shocks.[@sea-pratt-1995] The spring also makes the joint softer, so fast, stiff position control is harder.

## Hydraulic actuator {#hydraulic}

- **Good for:** huge force from a small part.
- **Not for:** small robots, or quiet and clean places.
- **Typical:** oil under high pressure, with a pump, valves and hoses.
- **Topic:** [[C6]]

Oil under high pressure pushes a piston. Nothing else gives as much force from so small a part, but it needs a pump, valves, hoses and careful sealing, and it is noisy and can leak.

<aside class="examples" aria-label="Common models: Hydraulic actuator">

**Common models** · checked 14 November 2026

- **From hydraulic to electric:** in April 2024 Boston Dynamics retired its hydraulic Atlas humanoid and introduced a fully electric one.[@atlas-electric]

</aside>

## Pneumatic actuator {#pneumatic}

- **Good for:** fast open-and-close jobs, such as grippers, and soft robots that inflate.
- **Not for:** holding a precise position in between.
- **Typical:** compressed air, valves, and a compressor or a tank.
- **Topic:** [[C6]]

Compressed air is fast and naturally springy, but because air compresses, holding a precise position in between is hard. Linear actuators and artificial muscles are covered in [[C6]].

## Which one? {#choose}

Start from the job the joint has to do, not from the motor:

- **It only has to point somewhere, and it's small and cheap?** A hobby servo, or a smart bus servo if you want to read its position back and chain many on one cable.
- **It has to drive a wheel?** A brushed gearmotor for a small robot; a brushless motor with a gearbox when it needs to be efficient or strong.
- **It has to move to exact positions, slowly, with a light load?** A stepper motor, if you can accept that it doesn't know when it has slipped.
- **It has to be stiff and precise, like a factory arm?** A harmonic-drive joint.
- **It hits the ground or touches people, and has to feel force?** A quasi-direct-drive actuator or a series elastic actuator: both can be pushed back, and both can sense force.
- **It needs huge force from a small part, and you can carry a pump?** Hydraulics.
- **It only needs to open and close, fast, like a gripper?** Pneumatics.

The [[~gear-ratio|gear ratio]] is the trade at the heart of most of these choices: more gearing gives more torque and precision, but less speed and less backdrivability. [[C2|Transmissions]] explains why.
