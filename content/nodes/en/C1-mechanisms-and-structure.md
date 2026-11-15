---
title: "Mechanisms and structure"
summary: "Links, joints, degrees of freedom, materials, fabrication and CAD."
---

## Why a robot needs it

A robot's body decides what it can do before any code runs: which ways it can move, how far it can reach, how much it bends under a load. Get the mechanism right and the motors and control have an easy job; get it wrong and no software can fix it.

## Links and joints

A robot body is made of [[~link|links]], the rigid parts, and [[~joint|joints]], which connect them. Each joint connects exactly two links.[@mr-joints] A joint lets the two links move relative to each other in some ways and not in others:

![Four joints in a two-by-two grid, each with its letter and a number. R 1: two bars meeting at a pin, with a curved arrow showing one turn. P 1: a bar sliding in a sleeve, with a straight arrow showing one move. U 2: two shafts joined by forks and a cross, with two curved arrows about crossed axes. S 3: a ball in a cup with a bar coming out of it, with three curved arrows.](fig:joint-types "Four common joints and their degrees of freedom: revolute R (a hinge, 1), prismatic P (a slide, 1), universal U (two crossed hinges, 2) and spherical S (a ball and socket, 3).")

- **Revolute (R)**, a hinge: it turns about one axis.[@mr-joints]
- **Prismatic (P)**, a slide: it moves along one line.[@mr-joints]
- **Universal (U)**: two hinges with crossed axes.[@mr-joints]
- **Spherical (S)**, a ball and socket, much like your shoulder.[@mr-joints]

## Degrees of freedom

The [[~degree-of-freedom|degrees of freedom]] of a body are the separate ways it can move. A body floating in space has six: three to move and three to turn. A body on a flat plane has three.[@mr-rigid-body-dof] A joint gives one, two or three, so a revolute joint lets one link turn against the next and holds back the other five.[@mr-joints]

For an open chain, like an arm, add up the joints' freedoms. A tool in space has six degrees of freedom, so an arm needs at least six joints to hold it at any position and at any angle within reach.[@mr-rigid-body-dof] When links form a closed loop, each loop takes freedoms away; Grübler's formula counts them (Go deeper, below).[@mr-grubler]

## Workspace

The [[~workspace|workspace]] is every place the robot's tool can reach. It depends on the robot's structure, not on the task.[@mr-workspace] The links' lengths set how far the tool can reach, and the joints' limits (cables, hard stops, the body getting in the way) cut parts of that away.

## Try it: where can the arm reach? {#try}

<reach-demo>
<p class="demo-nojs">This demo needs JavaScript: an arm with two links and two turning joints, seen from above, with the area its tip can reach shaded.</p>
</reach-demo>

What to try:

- **Equal links,** 25 cm each. The tip can reach all the way back to the shoulder: no hole in the middle.
- **Unequal links,** 30 and 20 cm. A hole of 10 cm radius opens round the shoulder: the tip can never get closer than the difference of the two lengths.
- **Elbow ±90°.** It can't fold back, so the hole grows.
- **Shoulder ±45°.** The ring narrows to a fan in front of the robot.

## Stiffness

Every link bends a little under a load, and the tool ends up away from where the control thinks it is. [[~stiffness|Stiffness]] is how much force it takes to bend a part by a given amount. For a link held at one end and loaded at the other, the bend at the tip grows with the cube of its length: twice as long sags eight times as much.[@cantilever-deflection] A stiffer material, or a deeper section, sags less.

## Materials

| Material | Density (kg/m³) | Stiffness, E (GPa) |
| --- | --- | --- |
| Steel | 7,850 | 200 |
| Titanium alloy | 4,430 | 120 |
| Aluminium (6061-T6) | 2,710 | 68.9 |
| PLA plastic (3D printing) | 1,240 | 2.7 |

The metals' values come from a strength-of-materials textbook,[@metal-properties] PLA's from a filament maker's data sheet, along its layers.[@pla-datasheet] E, the elastic modulus, says how stiff the material itself is.

Aluminium weighs about a third as much as steel and is about a third as stiff, so an aluminium link must be thicker to bend as little. Printed plastic is about 75 times less stiff than steel: fine for brackets, covers and small robots, not for a long arm carrying a load.

## Making parts

Parts are drawn first in CAD, computer-aided design, which also checks that they fit together and move without hitting each other. Then they are made:

- **3D printing** builds a part layer by layer. A printed part is stronger in one direction than another, so turn it on the print bed so its load doesn't pull the layers apart.[@prusa-orientation] PLA, for example, is less stiff and less strong across its layers than along them.[@pla-datasheet]
- **CNC milling** cuts a part from a solid block of metal or plastic with a spinning cutter, guided by the computer.
- **Laser cutting** cuts flat shapes from a sheet, which are then bolted or slotted together.

<details class="deeper">
<summary>Go deeper: the equations</summary>

Grübler's formula: a mechanism of N links (the ground counts as one) and J joints, joint i giving $f_i$ freedoms, with m = 3 in a plane and 6 in space:[@mr-grubler]

$$
\text{dof} = m\,(N - 1 - J) + \sum_{i=1}^{J} f_i
$$

A four-bar linkage (four links and four hinges in a loop, in a plane) has one:

$$
3\,(4 - 1 - 4) + 4 = 1
$$

The sag at the tip of a link fixed at one end, with a load P at the other:[@cantilever-deflection]

$$
\delta = \frac{P L^{3}}{3 E I}
$$

For the demo's arm, the tip's distance from the shoulder depends only on the elbow angle $q_2$:

$$
r^{2} = l_1^{2} + l_2^{2} + 2\,l_1 l_2 \cos q_2
$$

With both joints free, the workspace is a ring from $|l_1 - l_2|$ to $l_1 + l_2$, of area:

$$
\pi(l_1 + l_2)^{2} - \pi(l_1 - l_2)^{2} = 4\pi\,l_1 l_2
$$

</details>

## Common mistakes

- Making a link long and thin: its sag grows with the cube of its length.[@cantilever-deflection]
- Printing a load-bearing part so the load pulls its layers apart.[@prusa-orientation]
- Planning reach without the joint limits, which can cut big pieces out of the workspace.
- Counting the degrees of freedom of a closed loop by adding up its joints: the loop takes some away.[@mr-grubler]

## Where it leads

[[C2]] adds gears and belts between motor and joint, [[C3]] turns mechanisms into wheels and legs, [[C6]] covers actuators that aren't electric motors, and [[M3]] works out where an arm's or a leg's tip is from its joint angles.
