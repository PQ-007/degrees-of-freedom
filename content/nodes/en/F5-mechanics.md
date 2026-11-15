---
title: "Mechanics"
summary: "Newton's laws, torque, friction, energy and power: how forces move a robot, and how hard its motors must work."
---

## Why a robot needs it

Every robot pushes and is pushed: a wheel against the floor, an arm against gravity, a leg against the ground. Mechanics says how forces make things move, and so how strong a motor has to be, how fast a robot can speed up, and why it slips.

## Newton's three laws

1. **A body keeps doing what it's doing**, staying still or moving at a steady speed in a straight line, unless a net force acts on it. Its resistance to change is its [[~inertia|inertia]], and its mass measures it.[@newton-laws]
2. **Force equals mass times acceleration,** F = ma. Twice the force gives twice the acceleration; twice the mass, half.[@newton-laws]
3. **Every push comes with an equal push back.** When a wheel pushes the floor backward, the floor pushes the robot forward; a drone pushes air down and is pushed up.[@newton-laws]

## Torque

A motor doesn't push in a straight line; it twists. That twist is [[~torque|torque]]: the force times its lever arm, the perpendicular distance from the axis to the line the force acts along. It is measured in newton-metres, and a force aimed straight at the axis makes none.[@torque-def]

For a robot arm, this is why the same weight is hardest to hold with the arm stretched straight out, and costs almost nothing with the arm pointing straight up: only the horizontal distance counts. Motors are rated in torque ([[C4]]), and a gearbox multiplies it ([[~gear-ratio|gear ratio]]).

## Friction

[[~friction|Friction]] resists sliding between surfaces. Before anything slides, it can push back up to a limit; once sliding, it pushes back a little less, which is why it takes more force to start sliding than to keep going.[@friction-coef] Wheels need friction to drive. When they slip, the robot no longer moves the way its wheels turned, and [[~odometry|odometry]] goes wrong.

![A block resting on a hatched floor with four arrows: F pushing it to the right, f along the floor to the left, N pointing up from its top, and mg pointing down from its bottom.](fig:free-body "A free-body diagram: the push F, the friction f along the floor, the weight mg and the floor's push up, N. Drawing every force like this is the first step in working out how something will move.")

## Energy and power

Power is how fast work is done, measured in watts; for a force on something moving, it is the force times the speed.[@power-def] For something turning, power is torque times turning speed.[@power-def] So the same power can be a lot of torque at a low speed or a little torque at a high speed, and a gearbox trades one for the other. A motor's power decides how quickly a robot can lift, climb or speed up.

## Try it: can this motor hold it? {#try}

<lever-demo>
<p class="demo-nojs">This demo needs JavaScript: a motor holding a weight on an arm, with the torque it needs as you change the mass, the arm's length and its angle.</p>
</lever-demo>

The motor is the smart servo from the Hardware pages, rated at 1.4 N·m when stalled at 11.1 V.[@dynamixel-xl430]

What to try:

- **Half a kilogram on 20 cm,** straight out: about 1 N·m, which it holds.
- **Double the mass, or double the length:** the torque doubles, and it can't.
- **Raise the arm.** The dashed lever arm shrinks, and so does the torque; straight up, any weight is free to hold.
- **Find the heaviest load** for each length: the longer the arm, the lighter it must be.

<details class="deeper">
<summary>Go deeper: the equations</summary>

Newton's second law, for the net force on a mass $m$:[@newton-laws]

$$
F = m\,a
$$

Torque, for a force $F$ at distance $r$ from the axis, at angle $\theta$ to it:[@torque-def]

$$
\tau = r\,F \sin\theta
$$

Holding a mass $m$ on an arm of length $L$ raised $\varphi$ above level, the lever arm is $L\cos\varphi$, so

$$
\tau = m\,g\,L\cos\varphi
$$

with standard gravity $g = 9.80665$ m/s².[@standard-gravity] Friction while still, and while sliding:[@friction-coef]

$$
f_s \le \mu_s N, \qquad f_k = \mu_k N
$$

Power, moving and turning:[@power-def]

$$
P = F\,v, \qquad P = \tau\,\omega
$$

</details>

## Common mistakes

- Using the arm's full length instead of the horizontal distance.
- Mixing up mass and weight: a 1 kg mass weighs about 9.8 N.
- Forgetting the arm's own weight, and the motor's, when sizing a joint.
- Expecting the same grip from a wheel once it has started to slip.

## Where it leads

[[F6]] explains where a motor's force comes from, [[M4]] writes whole robots' motion as equations, [[C1]] and [[C2]] build the structures and gearboxes, and [[M8]] controls the forces a robot makes on the world.
