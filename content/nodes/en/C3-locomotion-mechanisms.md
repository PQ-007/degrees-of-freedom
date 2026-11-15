---
title: "Locomotion mechanisms"
summary: "Wheels, tracks, legs and rotors: how a robot moves through its world."
---

## Why a robot needs it

A mobile robot has to get from here to there: across a floor, a field, a pile of rubble or the air. The way it moves decides where it can go, how fast, and how long its battery lasts, and no single way is best everywhere.

![Six small drawings from above, in a grid of two columns and three rows. A square robot with a wheel on each side and a small caster, with curved arrows showing it spinning in place. A car with four wheels, the front two turned, the inner one more. A robot with four wheels whose rollers are drawn at an angle, with a sideways arrow. A robot with a long track on each side. A four-legged walker with its feet marked. A drone with four rotors on crossed arms, with curved arrows showing neighbouring rotors spinning opposite ways.](fig:locomotion-kinds "Six ways to move, seen from above: differential drive, a car with Ackermann steering, mecanum wheels, tracks, legs and a quadrotor.")

## Wheels

On flat, firm ground, wheels are the fastest and most efficient way to move.[@locomotion-review] An ordinary wheel rolls forward but can't slide sideways, and that one rule shapes how wheeled robots steer.[@mr-wheel-types]

- **[[~differential-drive|Differential drive]]:** two driven wheels on one axle, plus a caster to keep the robot level. It steers by turning its wheels at different speeds and can spin in place. It is perhaps the simplest wheeled robot.[@mr-diff-drive]
- **Car-like (Ackermann) steering:** two steered front wheels and two fixed rear ones. The front wheels turn by different angles so that none of them slips, and the car has a tightest turn it can make.[@mr-ackermann]
- **[[~omnidirectional|Omnidirectional]] wheels:** omniwheels and mecanum wheels carry free rollers round their rims, so the robot can slide sideways and move in any direction. With their small rollers they work best on hard, flat floors.[@mr-wheel-types]
- **[[~rocker-bogie|Rocker-bogie]]:** six wheels on a linkage that lets every wheel follow the ground. Perseverance uses it on Mars to drive over rocks about as big as its wheels.[@perseverance-components] See the [planetary rover](../../robots/planetary-rover/) and [Build 08](../../builds/rocker-bogie-rover/).

## Try it: steering with two wheels {#try}

<drive-demo>
<p class="demo-nojs">This demo needs JavaScript: a robot with two driven wheels, seen from above; set each wheel's speed and see its path over two seconds.</p>
</drive-demo>

What to try:

- **Both wheels 0.30 m/s.** Straight on: the turning radius is infinite.
- **Left −0.20, right 0.20.** It spins in place round the point between its wheels.
- **Left 0, right 0.30.** It pivots round its stopped left wheel, half the track (15 cm) away.
- **Left 0.15, right 0.30.** A gentle curve to the left: the × marks the centre of the circle.

## Tracks

Tracks spread the robot's weight over a long strip of ground, so it can cross soft and uneven ground and climb over obstacles. The price is speed and energy: tracked robots move more slowly and use more energy than wheeled ones.[@locomotion-review]

## Legs

Legs step over obstacles and climb stairs that stop wheels and tracks, and they cope well with uneven ground. They cost the most: many motors, complex mechanics and control, and, when walking slowly and statically, poor energy efficiency.[@locomotion-review] How legged robots balance and walk is [[I6]].

## Rotors

A quadrotor flies on four rotors on crossed arms, two spinning clockwise and two anticlockwise so that their turning torques cancel. It climbs, tilts and turns by changing each rotor's speed.[@quadcopter-rotors]

## Compared

| Rating | Wheels | Tracks | Legs |
| --- | --- | --- | --- |
| Speed | high | medium to high | low to medium |
| Soft ground | low | high | low to medium |
| Obstacles and stairs | low | medium | high |
| Energy efficiency | high | medium | low to medium |
| Complexity | low | low | high |

From a review of ground robots' locomotion; hybrids, such as legs with wheels, mix their strengths.[@locomotion-review]

<details class="deeper">
<summary>Go deeper: the equations</summary>

A differential-drive robot with wheel speeds $v_L$ and $v_R$, a track width W apart, moves forward at:[@mr-diff-drive]

$$
v = \frac{v_R + v_L}{2}
$$

and turns at:[@mr-diff-drive]

$$
\omega = \frac{v_R - v_L}{W}
$$

so it drives round a circle of radius:

$$
R = \frac{v}{\omega} = \frac{W}{2}\cdot\frac{v_R + v_L}{v_R - v_L}
$$

Equal speeds make R infinite (straight on), opposite speeds make it 0 (spinning in place), and one wheel stopped makes it W/2.

</details>

## Common mistakes

- Putting casters on a robot meant for outdoors, where they are often unsuitable.[@mr-diff-drive]
- Choosing mecanum wheels for rough ground: their small rollers want a hard, flat floor.[@mr-wheel-types]
- Planning a path that asks a car-like robot to turn tighter than it can, or to move sideways.[@mr-ackermann]
- Choosing legs when wheels would do: they cost far more in motors, control and energy.[@locomotion-review]

## Where it leads

[[M2]] works out how wheeled robots move from their wheel speeds, [[I3]] steers them round obstacles, and [[I6]] makes legs walk and run.
