---
title: "What is robotics"
summary: "The sense–think–act loop, what every robot is made of, and how to use this map."
---

## What a robot is

A robot is a machine that notices what is around it, decides what to do, and does it, again and again, without a person making every move. The international robotics vocabulary puts it more precisely: a *programmed actuated mechanism with a degree of autonomy* that moves itself, handles things, or puts them in place.[@iso-8373-robot]

The words "degree of autonomy" matter. A mechanical arm moved entirely by a person at a remote control is, by that definition, a *robotic device*, not a robot.[@iso-8373-robot] What makes a robot is that some of the deciding happens inside it.

Robotics is the craft of building such machines. It pulls together mechanical engineering, electronics, computer science, control theory and, more and more, machine learning. That is why this atlas is a map and not a single path.

## The sense–think–act loop

Every robot in this atlas, from a toy line follower to a Mars rover, runs the same loop:

1. **Sense.** Sensors turn the world into signals: a camera sees a doorway, an encoder counts how far a wheel has turned.
2. **Think.** A computer turns those signals into a decision: where am I, where should I go, how hard should each motor push?
3. **Act.** Motors and other actuators turn the decision into force and motion, and the world changes.

The sensors see that change, and the loop starts again. A real robot runs many of these loops at once, nested inside each other: a fast one keeps each motor at the right speed, a slower one keeps the robot balanced, and a much slower one decides where to go next.

## What every robot is made of

Robots pick different parts for different jobs, but the same kinds of parts appear in all of them:

| Part | Its job | Where in the tree |
|---|---|---|
| Body | Holds everything together and moves: links, joints, wheels, legs | [[C1]], [[C2]], [[C3]] |
| Actuators | Make force and motion | [[C4]], [[C5]], [[C6]] |
| Power | Stores energy and shares it out | [[C7]], [[C8]] |
| Sensors | Measure the robot itself and the world around it | [[C9]], [[C10]] |
| Compute | Runs the software, from tiny chips to full computers | [[C11]] |
| Communication | Carries signals between the parts, and to people | [[C12]] |
| Software | Turns signals into decisions | Tiers T2 to T6 |

## Kinds of robots

Robots are usually grouped by how they move and what they do: arms that stay in one place, wheeled and tracked robots, robots with two, four or six legs, flying and swimming robots, and robots that people wear. A factory arm and a walking robot share most of the parts above; they differ in which ones they pick and how they combine them. Later in the atlas, each kind of robot gets its own teardown.

## A short history

- **The word.** "Robot" first appeared in Karel Čapek's play *R.U.R.*, first staged in 1921. It comes from the Czech *robota*, drudgery, and Karel credited his brother Josef with the word.[@capek-robot]
- **The first industrial robot.** In 1961 the first Unimate went to work at a General Motors factory in Ewing, New Jersey, lifting hot metal parts out of moulds. George Devol had applied for its patent in 1954.[@unimate]
- **Today.** Robots weld cars, move goods in warehouses, assist surgeons, and drive across Mars.

## Why it's hard

For a person, the hard part of a task usually feels like the thinking. For a robot it is often the opposite. In 1988 the roboticist Hans Moravec noted that it was comparatively easy to make computers do well on intelligence tests or at games, but hard to give them the seeing and moving skills of a one-year-old child. This is known as Moravec's paradox.[@moravec-paradox]

The real world is also messy. Sensors are noisy, wheels slip, batteries sag, parts wear out, and nothing is exactly where the plan says. Much of robotics is about acting well in spite of that.

## How to use this map

- **The tech tree** has seven tiers, from T0 Foundations (this one) up to T6 Systems and the real world. Each topic lists what it needs and what it unlocks.
- **You don't have to go in order.** Pick a topic you care about and follow its *Needs* back down until you reach something you already know.
- **Three ways in:** by topic (the tech tree), by robot (pick a robot type and see what it is made of), or by question (side-by-side comparisons, such as which motor to use). The robot and question routes arrive later in the atlas.

<aside class="examples" aria-label="Real examples">

**Real examples** · checked 14 November 2026

- **Factory arm:** Unimate, the first industrial robot, at work in a General Motors factory from 1961.[@unimate]
- **Planetary rover:** NASA's Perseverance landed in Jezero Crater on Mars on 18 February 2021.[@perseverance-landing] Mars is so far away that nobody can steer it live with a joystick: people plan its drives in advance, and in December 2025 it also drove routes planned by AI.[@perseverance-ai-drive]

</aside>
