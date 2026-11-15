---
title: "Electronics basics"
summary: "Voltage, current and resistance, power, the parts on every board, PWM, reading a schematic, and working safely."
---

## Why a robot needs it

Between the battery and the motors sits a small world of circuits: power for the computer, drivers for the motors, wiring for every sensor. You don't need to design them all, but you do need to read them, wire them, and know why one gets hot or resets.

## Voltage, current and resistance

[[~voltage|Voltage]] is the push between two points, current is how much charge flows each second ([[F6]]), and resistance is how hard a part makes it for the current. Ohm's law ties them together, V = IR: double the voltage across a resistor and twice the current flows.[@ohms-law] Some parts don't follow it, the diode among them.[@ohms-law]

![A circuit diagram: a battery on the left, its longer plate marked plus and its shorter plate minus, with a V beside it. A wire runs up and along the top through a zigzag resistor marked R, then down through an LED, drawn as a triangle with a bar and two small arrows for light, and back along the bottom to the battery. An arrow marked I shows the current leaving the battery's plus side.](fig:simple-circuit "A circuit diagram: a battery's voltage V drives a current I through a resistor R and an LED. The resistor sets the current, so the LED isn't overloaded.")

## Power

The power a part uses is the voltage across it times the current through it, P = IV, and a resistor turns all of it into heat.[@electric-power] That is why a resistor, a [[~voltage-regulator|regulator]] or a motor driver carrying a large current gets hot, and why parts are rated for how many watts they can shed.

## The parts on every board

- **Resistors** set currents and divide voltages.
- **Capacitors** store charge.[@capacitor-def] Placed beside a chip, one takes small ripples out of its supply and briefly covers a dip.[@sparkfun-capacitors]
- **Diodes** let current through one way only. An LED is a diode that lights up, and a flyback diode across a motor soaks up the voltage spike its coil makes when switched off.[@sparkfun-diodes]
- **Transistors**, MOSFETs among them, are switches and amplifiers: a small signal from a [[~microcontroller|microcontroller]] controls a much larger current. Four of them in an H-bridge drive a motor both ways, which is what a [[~motor-driver|motor driver]] does.[@sparkfun-transistors]

## PWM: in-between voltages from a switch

A microcontroller's pin is either on or off. [[~pwm|PWM]] switches it on and off quickly and varies the share of each period it is on, the duty cycle; repeated fast enough, the motor or LED behaves as if it had a steady voltage in between. Arduino boards switch at about 500 times a second.[@arduino-pwm] A motor's speed roughly follows the average voltage: its back EMF grows with speed until it nearly matches the voltage it is given.[@back-emf]

## Try it: PWM and a motor {#try}

<pwm-demo>
<p class="demo-nojs">This demo needs JavaScript: a 12 V supply switched on and off at a duty cycle and frequency you choose, with the average voltage and a motor's speed.</p>
</pwm-demo>

What to try:

- **Duty cycle 50%.** The average is 6 V, and the motor settles at half speed.
- **Slow switching, 2 Hz.** The motor speeds up during each pulse and coasts down between them: the speed ripples.
- **Fast switching, 500 Hz.** Same average, but the motor can't follow each pulse, and its speed is smooth.

## Reading a schematic

A schematic shows what connects to what, not where the parts sit. Each part has a symbol, like the ones in the diagram above, and the lines are the wires between them. A part's datasheet gives its limits, such as the most voltage, current and power it can take. Stay well inside them.

## Working safely

Robot electronics usually run on low voltages, but batteries can deliver large currents. A damaged or wrongly charged lithium battery can catch fire or explode, so charge it with a charger made for it and stop using one that swells or gets hot.[@osha-lithium] Fit a fuse, keep a switch you can reach, and check polarity before powering anything up.

<details class="deeper">
<summary>Go deeper: the equations</summary>

Ohm's law:[@ohms-law]

$$
V = I\,R
$$

Power, and for a resistor:[@electric-power]

$$
P = I\,V = I^2 R = \frac{V^2}{R}
$$

A capacitor's charge:[@capacitor-def]

$$
Q = C\,V
$$

With PWM at duty cycle $D$ from a supply $V_s$, the voltage is $V_s$ for a share $D$ of each period and 0 for the rest, so its average is

$$
\bar{V} = D\,V_s
$$

</details>

## Common mistakes

- Connecting an LED without a resistor: it draws all the current it can and destroys itself.[@sparkfun-leds]
- Joining the logic and motor supplies without a common ground, or running the motor's current through the logic's ground wire ([[~ground|ground]]).
- Forgetting a flyback diode on a motor switched by a bare transistor.
- Choosing a resistor for its ohms but not its watts.

## Where it leads

[[F8]] programs the microcontroller, [[C7]] and [[C8]] cover batteries and power electronics, [[L3]] builds motor drivers, and [[L5]] reads sensors through these circuits.
