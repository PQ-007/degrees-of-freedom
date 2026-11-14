---
title: "Actuators"
summary: "Which motor or actuator should move this joint? The common options side by side, and how to choose."
---

## How to choose

Start from the job the joint has to do, not from the motor:

- **It only has to point somewhere, and it's small and cheap?** A hobby [[~servo|servo]], or a smart bus servo if you want to read its position back and chain many on one cable.
- **It has to drive a wheel?** A brushed gearmotor for a small robot; a [[~brushless-motor|brushless motor]] with a gearbox when it needs to be efficient or strong.
- **It has to move to exact positions, slowly, with a light load?** A [[~stepper-motor|stepper motor]], if you can accept that it doesn't know when it has slipped.
- **It has to be stiff and precise, like a factory arm?** A harmonic-drive joint.
- **It hits the ground or touches people, and has to feel force?** A [[~quasi-direct-drive|quasi-direct-drive actuator]] or a [[~series-elastic-actuator|series elastic actuator]]: both can be pushed back, and both can sense force.
- **It needs huge force from a small part, and you can carry a pump?** Hydraulics.
- **It only needs to open and close, fast, like a gripper?** Pneumatics.

Two words in the table need a word of explanation. **[[~backdrivable|Backdrivable]]** means you can turn the output by hand and the motor turns with it; a joint that can be pushed back is safer when it hits something and can feel forces through its motor. **[[~gear-ratio|Gear ratio]]** is the trade at the heart of most of these options: more gearing gives more torque and precision, but less speed and less backdrivability. [[C2|Transmissions]] explains why.

## Each option

### Brushed DC gearmotor

The simplest choice: a DC motor runs faster with more voltage and pushes harder with more current, and a small gearbox trades its speed for [[~torque|torque]]. On its own it doesn't know where it is; add an encoder to [[~control-loop|close the loop]]. Worm gears lock in place when the power is off, which helps hold a load but means the joint can't be pushed back.

### Hobby servo

A gearmotor, a potentiometer and a little control circuit in one box: you send a pulse that says "go to this angle" and it holds that angle. Cheap and easy, but weak, not very precise, and it tells you nothing back.

### Smart bus servo

A servo with its own microcontroller. Many of them share one data cable; you send each one a target, and it reports its position, load and temperature back. A common way to build small humanoids and arms.

### Stepper motor

A stepper moves one fixed step for each pulse it is sent, so a controller can count pulses to know where it is without a sensor. That works until the load is more than the motor can push: then it can skip steps, and nothing notices.[@stepper-lost-steps] Its torque also falls as it speeds up. That makes steppers a good fit for light, repeatable machines like 3D printers.

### Brushless motor + gearbox

Brushless motors are efficient and powerful for their size but need a driver that switches their coils in the right order, usually with feedback from a sensor. Paired with a planetary gearbox, they are the workhorse of mobile robots and many robot arms.

### Quasi-direct-drive (QDD)

A large, high-torque brushless motor with only a little gearing. With so little gearing the joint is backdrivable, survives hard impacts, and can sense force from the motor's current alone, without a separate force sensor. The MIT Cheetah's legs were built this way.[@qdd-cheetah] It is the usual choice for dynamic legged robots.

### Harmonic-drive joint

A strain-wave gear packs a large reduction into one compact stage with almost no [[~backlash|backlash]].[@harmonic-drive] That makes joints stiff and precise, which is why industrial and collaborative arms use them. The price is cost, and joints that can hardly be pushed back.

### Series elastic actuator (SEA)

A spring sits on purpose between the gearbox and the load. Measuring how far the spring stretches tells you the force, which makes force control easier, and the spring protects the gears from shocks.[@sea-pratt-1995] The spring also makes the joint softer, so fast, stiff position control is harder.

### Hydraulic actuator

Oil under high pressure pushes a piston. Nothing else gives as much force from so small a part, but it needs a pump, valves, hoses and careful sealing, and it is noisy and can leak. Large legged robots and heavy machines have used it.

### Pneumatic actuator

Compressed air is fast and naturally springy, but because air compresses, holding a precise position in between is hard. Pneumatics shine at simple, fast open-and-close jobs, such as factory grippers, and in soft robots that inflate.

Linear actuators and artificial muscles are covered in [[C6]].

<aside class="examples" aria-label="Real examples">

**Real examples** · checked 14 November 2026

- **Quasi-direct-drive legs:** the MIT Cheetah quadruped.[@qdd-cheetah]
- **From hydraulic to electric:** in April 2024 Boston Dynamics retired its hydraulic Atlas humanoid and introduced a fully electric one.[@atlas-electric]

</aside>
