---
title: "Classical control"
summary: "Feedback, PID, stability, tuning, anti-windup and cascaded loops."
---

## What a controller does

A controller compares what the robot is doing with what it should be doing, and changes its command to close the gap. The gap is the *error*: the target minus the measurement. Measure, compare, correct, and again: that is a [[~control-loop|control loop]]. Classical control is the set of simple, widely used ways to design such a loop, and one of them comes first.

## PID

PID is by far the most common way feedback is used in engineering. In one survey of over eleven thousand controllers in refineries, chemical plants and paper mills, 97% were PID.[@pid-common] Its command is the sum of three terms, each with its own *gain*, a number you choose:

- **P, proportional,** pushes in proportion to the error now. Bigger error, harder push.
- **I, integral,** adds up the error over time. A small error that lasts keeps growing the push until the error is gone.
- **D, derivative,** reacts to how fast the error is changing, a guess at where it is heading. It damps swings, but it also amplifies sensor [[~noise|noise]].[@pid-terms]

Tuning a PID means choosing the three gains. Too little and the loop is slow or never gets there; too much and it overshoots, shakes or goes unstable.

## Try it: balance a pole {#try}

A pole hinged on a cart falls over unless the cart keeps moving under it. Here the pole's tilt is the error: when it leans right, the controller pushes the cart right. The demo runs MuJoCo, a physics engine built for robotics research, in your browser.[@mujoco]

<cartpole-demo>
<p class="demo-nojs">This demo needs JavaScript: a cart on a rail with a pole on top, which you keep upright by tuning a PID controller.</p>
</cartpole-demo>

What to try:

- **P + D,** then **Push the pole.** The cart darts under the pole, catches it, and drifts back to the middle.
- **Only P.** Nothing damps the swing, so each correction overshoots the last, and the pole falls.
- **Too little P.** The push is too weak to catch the pole as it leans.
- **Too much D.** The pole stays up, but everything is sluggish and the cart wanders along the rail.
- Then move the sliders yourself. **I** barely helps here, because nothing pushes steadily on the pole; it earns its place when something does, such as a load hanging on a joint.

Two things in this demo aren't PID. A second loop with fixed gains keeps the cart near the middle of the rail; you only tune the angle loop. And the controller runs 100 times a second, like one on a small [[~microcontroller|microcontroller]], while the physics runs 500 times a second. The model leaves out the motor (the force simply appears, up to 20 N), friction and flex.

## Where PID runs out

- **Saturation.** A motor can only push so hard. While it is at its limit the integral keeps growing, and when the error finally reverses, the stored-up integral makes it overshoot. Real controllers stop the integral while the output is limited (anti-windup).[@pid-terms] See [[~saturation|saturation]].
- **Noise.** D amplifies noise, so it is usually filtered or taken from a sensor that measures the rate directly, such as a gyro ([[~filter|filters]]).
- **Delay.** A loop that reacts late reacts to the past, and starts to oscillate ([[~latency|latency]]).
- **Several things at once.** One PID controls one quantity. The cart-pole has two, the pole and the cart, and this demo needed a second loop. [[M6]] designs one controller for all of them.
