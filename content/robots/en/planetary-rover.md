---
title: "Planetary rover"
summary: "A robot that drives, looks and takes samples on another planet, for years, with nobody near enough to help."
figureAlt: "Line drawing of a six-wheeled rover from the side, with numbered parts: mast cameras, hazard cameras, the computers in the body, the wheels and suspension, the robotic arm, the power source and the antennas."
glance:
  - label: "Job"
    value: "Drive, look and take samples on another planet, alone, for years"
  - label: "Moves on"
    value: "Six wheels on a rocker-bogie suspension"
  - label: "Power"
    value: "Nuclear (heat from plutonium) or solar, with batteries"
  - label: "Thinks with"
    value: "Slow, radiation-hardened computers, with a spare"
  - label: "Talks to Earth"
    value: "Mostly through orbiters, minutes away each way"
  - label: "Driven by"
    value: "Plans sent from Earth, and its own hazard avoidance"
---

## Job and environment {#job}

A planetary rover explores somewhere no person can reach. It drives across rough, unmapped ground, photographs it, measures it, and collects samples, for months or years. On Mars it is cold, dusty and exposed to radiation, and help is always millions of kilometres away. Nothing can be repaired, so every part is designed to keep working, or to fail safely and wait for instructions.

## Body {#body}

Six wheels on a [[~rocker-bogie|rocker-bogie]] suspension. On each side, a long arm (the rocker) joins the front wheel to a pivot on the body and to a shorter arm (the bogie) that carries the middle and rear wheels. There are no springs: the linkage lets every wheel follow the ground, so the rover can roll over rocks and through dips about as large as a wheel, and it can lean a long way without tipping over.[@perseverance-components]

On top sit a mast with cameras, the antennas, and at the front an arm that carries instruments and tools. The computers and electronics live inside the body, which is kept warm. [[C1]] and [[C3]] explain these mechanisms.

## Actuators and transmissions {#actuators}

Electric motors, each behind a large gear reduction: one to drive each wheel, more to steer the corner wheels, and one for each joint of the arm and the mast. Speed hardly matters to a rover; strength, precision and holding still do, which is what high gearing gives. [[C4]] and [[C5]] compare the options.

## Power {#power}

There are two ways to power a rover. **Solar panels** with batteries are light, but they give less power in winter and as dust settles on them. NASA's solar-powered Spirit and Opportunity were expected to be limited by dust, and a dust storm that covered Mars in 2018 ended Opportunity's mission.[@mer-solar]

A **[[~radioisotope-power|radioisotope power system]]** turns the heat of decaying plutonium-238 into electricity, day and night, whatever the dust. It gives only about as much power as a light bulb, so batteries cover the peaks when the rover drives or runs its instruments.[@perseverance-power] Either way the budget is small, and a rover does one thing at a time. [[C7]] and [[C8]] cover power.

## Sensors {#sensors}

Cameras do most of the work: stereo pairs on the mast for planning and hazard cameras low on the body for spotting rocks while driving.[@perseverance-components] An [[~imu|inertial measurement unit (IMU)]] senses tilt and turning, and counting wheel turns gives the distance driven. Wheels slip in sand, though, so comparing camera images from one stop to the next ([[~odometry|visual odometry]]) corrects the estimate. The science instruments on the arm and mast are sensors too. See [[C9]] and [[C10]].

## Compute {#compute}

Space radiation flips bits in memory and can damage ordinary chips, so rovers use radiation-hardened processors that are slow by everyday standards, and they carry a [[~redundancy|spare computer]] that can take over.[@perseverance-components] Recent rovers add a separate computer for the image processing that driving needs.[@perseverance-size] See [[C11]].

## Communication {#communication}

Radio signals take minutes to travel between Earth and Mars: about 3 minutes when the planets are closest and over 22 when they are farthest apart.[@mars-light-time] Most of a rover's data goes up to orbiters passing overhead, which relay it to Earth; a dish antenna on the rover receives each day's commands straight from Earth.[@perseverance-telecom] See [[C12]].

## Software and loop rates {#software}

The rover runs loops nested inside each other. The fastest keep each motor at its commanded speed and angle. Above them, a driving loop looks at the ground, [[~hazard-avoidance|plans a short path between hazards]], and moves. The slowest loop runs through Earth: people review what the rover did, plan the next day, and send the commands, which arrive each Martian morning.[@perseverance-telecom] [[S1]] explains how such layers fit together.

## Control and key algorithms {#control}

- Motor control for the wheels, steering and arm joints: [[L4]], [[M5]].
- The [[~kinematics|kinematics]] of six wheels and four steering motors: [[M2]].
- Estimating position from the IMU, wheel odometry and visual odometry: [[P4]].
- Finding hazards in stereo images and planning a path between them: [[P7]], [[I3]].
- Placing instruments with the arm: [[M3]].

## The hard problems {#hard-problems}

- **Nobody can drive it live.** The delay rules out a joystick, so people plan drives in advance and the rover looks after itself in between.[@perseverance-ai-drive]
- **Nothing can be fixed.** Every part has to survive cold, dust and radiation for years, with spares and [[~safe-mode|safe modes]].
- **Every watt and every minute of radio time counts.** They decide what the rover can do each day.
- **Sand and slopes.** Wheels slip and sink, so the rover has to notice when it isn't moving the way it planned.

## Real examples {#examples}

<aside class="examples" aria-label="Real examples">

Checked 14 November 2026

- **Spirit and Opportunity (NASA):** solar-powered twins that landed in early 2004, designed for 90 Martian days. A planet-wide dust storm ended Opportunity's mission in 2018.[@mer-solar]
- **Perseverance (NASA):** landed in Jezero Crater on 18 February 2021.[@perseverance-landing] About 1,025 kg and 3 m long, with 19 cameras and a 2 m arm with five joints.[@perseverance-size] A radioisotope generator gives about 110 W at the start of the mission.[@perseverance-power] Its main computer runs at up to 200 MHz.[@perseverance-components] In December 2025 it drove routes planned by AI.[@perseverance-ai-drive]

</aside>

## How to start building a small one {#start}

A small rocker-bogie rover is a good first big project: six small gearmotors, a linkage you can 3D-print or cut from sheet, a [[~microcontroller|microcontroller]], a battery and a camera. On the tech tree, start with [[F7]], [[C4]], [[L1]] and [[L3]], then [[M2]] and [[I3]]. Build 08, linked at the top of this page, walks through one step by step.
