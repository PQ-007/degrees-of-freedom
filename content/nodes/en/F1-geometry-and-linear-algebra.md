---
title: "Geometry and linear algebra"
summary: "Units, angles in radians, vectors, coordinate frames and rotations: how a robot says where things are."
---

## Why a robot needs it

A robot has to keep track of where things are: its wheels, the joints of its arm, the cup it is reaching for, the wall a sensor has just seen. All of that is geometry, written as numbers a computer can work with. This page covers the few ideas the rest of the atlas uses again and again: units, angles, vectors, coordinate frames and rotations.

## Units

Every number in a robot has a unit, and mixing units up is an easy, expensive mistake. NASA lost the Mars Climate Orbiter in 1999 because software on the ground worked in English units while the spacecraft's software expected metric; the error sent it too close to Mars.[@mco-units] Robot software usually keeps to SI units throughout. The convention used by ROS, a widely used robot software framework, is metres, kilograms, seconds and radians.[@ros-rep103]

## Angles in radians

Degrees split a full turn into 360. [[~radian|Radians]] measure an angle by the arc it cuts off: one radian is the angle at which the arc is as long as the radius, so a full turn is 2π (about 6.28) radians and a right angle is π/2.[@si-radian] Maths libraries and robot software work in radians; degrees are for people.

Sine and cosine turn an angle into the x and y of a point on a circle of radius 1. Every wheel angle, joint angle and camera angle in a robot passes through them.

![A circle of radius 1 centred where an x axis and a y axis cross. A radius at angle θ from the x axis meets the circle at a point. Dashed lines from that point mark its x coordinate, cos θ, and its y coordinate, sin θ. The arc from the x axis to the point is highlighted.](fig:unit-circle "The unit circle: the point at angle θ is at (cos θ, sin θ). In radians, θ is also the length of the highlighted arc.")

## Vectors

A [[~vector|vector]] is a size and a direction. It is drawn as an arrow and written as numbers, its components: (3, 4) means 3 along x and 4 along y. Its length comes from Pythagoras' theorem, √(3² + 4²) = 5. Adding vectors chains movements: go (3, 4), then (1, −2), and you end up at (4, 2). Positions, velocities and forces are all vectors.

## Coordinate frames

A [[~coordinate-frame|coordinate frame]] is an origin and a set of axes to measure from. The same point has different coordinates in different frames: an obstacle 1.6 m ahead of a robot is "1.6 m ahead" in the robot's frame, and somewhere else entirely on the map. A robot has many frames: the world, its body, each joint, each sensor. ROS's convention for a body is x forward, y left and z up, with every frame right-handed.[@ros-rep103]

## Rotations and matrices

To move a point from the robot's frame to the world's, turn it by the robot's heading, then add the robot's position. A [[~rotation-matrix|rotation matrix]] does the turning: a small grid of numbers built from cos θ and sin θ, which rotates any vector it multiplies. Multiplying two rotation matrices gives one rotation followed by the other, and the order generally matters: in 3D, turning a box about x and then y doesn't end the same as y and then x. Turning back is easy, because a rotation matrix's inverse is its transpose, its rows and columns swapped.[@mr-rotations]

Robots usually pack the rotation and the position into one larger matrix, a homogeneous transformation, so that a whole chain of frames is one multiplication after another.[@mr-rotations]

## Try it: one point, two frames {#try}

<frames-demo>
<p class="demo-nojs">This demo needs JavaScript: a robot on a map and a point its sensor sees, with that point's coordinates in the robot's frame and in the world's.</p>
</frames-demo>

What to try:

- **Turn the robot.** P's coordinates in the robot's frame stay the same; in the world's frame they swing round.
- **Set the heading to 90°.** "Ahead" now points along the world's Y axis.
- **Watch the matrix.** At 0° it is all 1s and 0s and changes nothing; at any angle its numbers are cos θ and sin θ.

<details class="deeper">
<summary>Go deeper: the equations</summary>

A point $p_R$ in the robot's frame, for a robot at position $t$ with heading $\theta$, is at

$$
p_W = R(\theta)\,p_R + t
$$

in the world's frame, where the rotation matrix is

$$
R(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}
$$

Back again, $p_R = R(\theta)^\top (p_W - t)$, because $R^{-1} = R^\top$.[@mr-rotations]

In 3D a rotation is a 3 × 3 matrix, and a rotation and a position together make a 4 × 4 homogeneous transformation:

$$
T = \begin{bmatrix} R & t \\ 0 & 1 \end{bmatrix}
$$

A chain of frames, say world to body to arm joint to camera, is the product $T_{WB}\,T_{BJ}\,T_{JC}$, in that order.

</details>

## Common mistakes

- Degrees where radians were expected, or the other way round.
- Adding coordinates that belong to two different frames.
- Multiplying rotations in the wrong order.
- Forgetting which way an axis points: is y to the left or the right, is z up or down?

## Where it leads

[[M1]] works with frames and transforms in 3D. [[M2]] and [[M3]] use them to work out where wheels and arms take a robot, and [[F2]] adds change over time.
