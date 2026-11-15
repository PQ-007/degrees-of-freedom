---
title: "Electromagnetism"
summary: "Charge, current, magnetic fields and induction: why motors turn, and how many sensors work."
---

## Why a robot needs it

Almost every robot runs on electricity, and electromagnetism is how it becomes motion. The same few effects explain why a motor turns, why it pushes back on its own supply, and how Hall sensors and encoders feel a turning shaft.

## Charge and current

Electric current is a flow of charge: how much charge passes a point each second. One ampere is one coulomb per second.[@current-def] [[F7]] covers the voltage that pushes it and the circuits it flows through.

## Force on a wire

A wire carrying a current through a magnetic field is pushed sideways, at right angles to both the wire and the field. The push grows with the current, the field and the length of wire in the field.[@magnetic-force-wire]

## How a motor turns

Bend that wire into a loop and put it between a magnet's poles. The current runs one way along one side of the loop and the other way along the other, so one side is pushed up and the other down: a [[~torque|torque]] that turns the loop. Reverse the current at the right moments and it keeps turning one way. That is an electric motor, turning electrical energy into mechanical work, and more turns of wire, more current or a stronger magnet give more torque.[@current-loop-motor] [[C4]] compares the kinds.

![Seen along a motor's axis: the N pole of a magnet on the left and the S pole on the right, with field arrows B between them. A loop of wire, seen edge-on as a slanted line, has a wire at each end: a dot on the left for current coming out of the page and a cross on the right for current going in. An arrow F pushes the left wire up and another pushes the right wire down, and a curved arrow shows the loop turning clockwise.](fig:motor-principle "How a motor turns: the field B pushes the wire with current coming out (dot) one way and the wire with current going in (cross) the other, so the loop turns.")

## Induction

It works the other way round too. Change the magnetic field through a coil, for instance by pushing a magnet in or pulling it out, and a voltage appears: [[~induction|electromagnetic induction]]. The faster the change and the more turns, the bigger the voltage.[@faraday-law] Its direction always opposes the change that caused it.[@lenz-law] Generators work this way.

## Back EMF

A spinning motor is a generator as well. It makes its own voltage against its supply, the [[~back-emf|back EMF]]: zero when the motor is still, and growing with its speed. So a motor draws its largest current when it first starts or when it is stalled, and more current when a load slows it down; run too slowly under load, it can overheat.[@back-emf] That burst of current at start-up is why a robot's microcontroller can reset when its motors switch on, and why motor drivers limit current ([[L3]], [[L4]]).

## The Hall effect

A magnetic field also pushes sideways on the charges flowing in a thin strip, which makes a small voltage across it: the Hall effect. It is used to measure magnetic fields.[@hall-effect] Hall sensors read a magnet on a motor's shaft to count its turns, as in a magnetic [[~encoder|encoder]].[@pololu-encoder]

## Try it: a magnet through a coil {#try}

<induction-demo>
<p class="demo-nojs">This demo needs JavaScript: a magnet swinging in and out of a coil, with the coil's voltage traced as it moves.</p>
</induction-demo>

What to try:

- **Watch the trace.** The voltage peaks as the magnet enters and leaves the coil, and flips sign between moving in and moving out.
- **Pause.** No motion, no voltage, however close the magnet is.
- **Double the speed, or the turns.** The largest voltage doubles too.

<details class="deeper">
<summary>Go deeper: the equations</summary>

Current is the rate at which charge flows:[@current-def]

$$
I = \frac{dQ}{dt}
$$

The force on a length $l$ of wire carrying current $I$ across a field $B$, at angle $\theta$ to it:[@magnetic-force-wire]

$$
F = I\,l\,B \sin\theta
$$

The torque on a coil of $N$ turns, each of area $A$:[@current-loop-motor]

$$
\tau = N\,I\,A\,B \sin\theta
$$

Faraday's law, for a coil of $N$ turns whose flux $\Phi$ changes:[@faraday-law]

$$
\varepsilon = -N\,\frac{d\Phi}{dt}
$$

The minus sign is Lenz's law: the voltage opposes the change.[@lenz-law]

</details>

## Common mistakes

- Sizing a power supply for a motor's running current and forgetting the much larger current at start-up.
- Leaving a stalled motor powered: with no back EMF, the current stays high and it heats up.
- Running sensor wires right beside motor wires: changing currents nearby can induce noise in them.

## Where it leads

[[F7]] builds circuits, [[C4]] compares electric motors, [[L3]] drives them, [[L4]] controls their current and speed, and [[C9]] uses magnets and coils to sense position.
