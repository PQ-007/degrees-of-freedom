---
title: "Transmissions"
summary: "Gears, harmonic and cycloidal drives, belts, screws and cables: trading speed for torque."
---

## Why a robot needs it

A robot's joints want to move slowly and push hard. Most electric motors do the opposite: they spin at thousands of rpm with little torque. A [[~transmission|transmission]] sits between the two, slowing the motion down and raising the torque: gears, belts, chains or cables.[@mr-gearing]

## Gear ratio

When a small gear drives a bigger one, the [[~gear-ratio|gear ratio]] is the driven gear's teeth over the driving gear's: 12 teeth turning 48 make 4 to 1.[@khk-gear-ratio] The output turns four times slower and, with no losses, with four times the torque.[@mr-gearing] The power, torque times speed, stays the same: a gear trades speed for torque, it doesn't make energy. Two gears in mesh turn opposite ways, and the ratios of stages in a row multiply.[@khk-gear-ratio]

Real gears lose some power to friction, so the torque is a little less than the ratio says. Motors are so fast that robot joints often have ratios of 100 to 1 or more.[@mr-gearing]

## Try it: gears {#try}

<gears-demo>
<p class="demo-nojs">This demo needs JavaScript: a 12-tooth gear on a motor turning a bigger gear, with the output's speed, torque and angle, and backlash you can add.</p>
</gears-demo>

What to try:

- **Turn the motor a full turn.** With 36 teeth on the output, it turns a third of a turn, the other way, with three times the torque.
- **60 teeth.** 5 to 1: slower still, and stronger.
- **Backlash 4°,** then turn the motor forward and back. When it reverses, the output stands still until the motor has crossed the gap.

## Kinds of transmission

![Four drawings in a two-by-two grid. Top left: a small gear meshing with a gear twice its size, curved arrows showing they turn opposite ways. Top right: a ring with teeth on its inside, a small gear in its centre and three gears between, their centres joined by a triangle. Bottom left: a belt looped over a big and a small pulley. Bottom right: a threaded rod coming out of a motor block, with a nut on it and a two-headed arrow along the rod.](fig:transmission-kinds "Four ways to pass on a motor's turning: spur gears, a planetary set (sun, planets, ring; the carrier joining the planets is the output), a belt over two pulleys, and a lead screw that drives a nut along it.")

- **Spur gears.** The simplest: two toothed wheels side by side. For a big ratio, add stages.
- **Planetary gears.** A sun gear in the middle, planet gears around it, a ring with teeth on its inside, and a carrier joining the planets. The planets share the load, so the gearbox is compact.[@khk-gear-ratio]
- **Harmonic (strain-wave) drives.** A wave generator flexes a thin toothed cup, the flexspline, inside a rigid toothed ring, the circular spline: a large ratio in one stage with almost no backlash.[@harmonic-drive] See the [harmonic drive](../../hardware/motors/harmonic/) in Hardware.
- **Cycloidal drives.** Cam discs roll round a ring of rollers, with almost half of each disc's cams touching at once; ratios of about 30 to over 300 to 1, and the maker of one type says it takes up to five times its rated torque in an emergency stop.[@nabtesco-cycloidal]
- **Belts, chains and pulleys** carry motion to where it's needed, with a ratio from the pulleys' sizes.[@mr-gearing]
- **Screws** turn rotation into straight-line motion. In a ball screw, balls roll between the screw and the nut: it is over 90% efficient, and needs a third or less of the torque of a plain sliding screw.[@thk-ball-screw]
- **Cables and tendons** let the motors sit in the robot's base and pull the joints from afar, so the arm itself is light.[@mr-cable-drive]
- **Direct drive,** no transmission at all: little friction, but the motor must be big and heavy to give the torque.[@mr-gear-tradeoffs] A [quasi-direct-drive actuator](../../hardware/motors/qdd/) sits between the two, with a big motor and a low ratio.[@qdd-cheetah]

## What a gearbox costs

- **[[~backlash|Backlash]]:** play between the teeth, so the output can move a little with the motor still. It makes precise control near standstill hard.[@mr-gear-tradeoffs]
- **Friction:** it eats torque and makes the output torque uncertain, and it often grows with the ratio.[@mr-gear-tradeoffs]
- **[[~reflected-inertia|Reflected inertia]]:** the motor's rotor spins G times faster than the joint, so it feels G² times heavier at the joint. With a big ratio it can outweigh the link itself.[@mr-apparent-inertia]

Together these decide whether a joint is [[~backdrivable|backdrivable]]: whether you can push it by hand. A joint with a low ratio can be pushed, can survive knocks, and can feel forces through its motor's current.[@qdd-cheetah]

<details class="deeper">
<summary>Go deeper: the equations</summary>

A gear ratio G divides the speed:[@mr-gearing]

$$
\omega_\text{out} = \frac{\omega_\text{motor}}{G}
$$

and multiplies the torque, with efficiency η ≤ 1:[@mr-gearing]

$$
\tau_\text{out} = \eta\,G\,\tau_\text{motor}
$$

Stages multiply:[@khk-gear-ratio]

$$
G = G_1\,G_2
$$

A planetary set with the sun as input, the carrier as output and the ring fixed:[@khk-gear-ratio]

$$
G = \frac{z_\text{ring}}{z_\text{sun}} + 1
$$

The rotor's inertia, felt at the joint:[@mr-apparent-inertia]

$$
I_\text{felt} = G^{2}\,I_\text{rotor}
$$

</details>

## Common mistakes

- Choosing a big ratio for a joint that must be pushed by hand, take knocks or feel forces: the reflected inertia and friction make it stiff and fragile.[@mr-apparent-inertia]
- Expecting the full ratio times the motor's torque: friction takes its share.[@mr-gear-tradeoffs]
- Tuning a position loop without allowing for backlash: near the target the output rattles in the gap.[@mr-gear-tradeoffs]
- A ball screw on a vertical axis with no brake: it runs just as well backwards, so the load can drive it down when the power goes.[@thk-ball-screw]

## Where it leads

[[C5]] packs motor, gearbox and sensors into one actuator, [[C3]] uses transmissions to drive wheels and legs, and [[L4]] controls the motor behind the gears.
