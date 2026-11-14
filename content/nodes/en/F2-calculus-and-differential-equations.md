---
title: "Calculus and differential equations"
summary: "Rates of change, adding up, and differential equations as rules for how things evolve, followed one small step at a time."
---

## Why a robot needs it

A robot is always changing: its wheels turn, its arm swings, its battery drains. Calculus is the maths of change. It has two halves that undo each other: one finds how fast something is changing, the other adds small changes up. Differential equations use both to say how a system evolves, and a computer follows them one small step at a time.

## Rates of change

The [[~derivative|derivative]] of a quantity is how fast it is changing: the slope of its graph at a moment. Velocity is the derivative of position, and acceleration is the derivative of velocity.

A robot that measures only position, say with a wheel [[~encoder|encoder]], works out speed by dividing a small change in position by the small time it took. That works, but it magnifies [[~noise|noise]]: a tiny wobble in a measurement, divided by a tiny time, becomes a large wobble in speed.

## Adding up

The [[~integral|integral]] goes the other way: it adds up small pieces. The area under a velocity graph between two moments is the distance covered in between. Adding up a rate is how a robot keeps track of what it can't measure directly: wheel turns add up to distance travelled, current drawn adds up to charge used. Every small error is added up too, so the total drifts, which is why [[~odometry|odometry]] needs correcting.

![Two graphs side by side. Left: a curve of position x against time t, with a straight tangent line touching it at one point and a small right-angled triangle on the tangent marking a step Δt across and Δx up. Right: a curve of velocity v against time t, with the area under it between two times, t₁ and t₂, shaded and labelled Δx.](fig:slope-and-area "Left: the slope of the position curve, Δx over Δt, is the velocity at that moment. Right: the area under the velocity curve between t₁ and t₂ is the distance covered, Δx.")

## Differential equations

A [[~differential-equation|differential equation]] is a rule for how fast something changes, given how it is now. A motor spinning up follows a simple one: the further it is from its final speed, the faster it speeds up, so it rushes at first and creeps over the last stretch. Its time constant τ says how quick it is: after one τ it has covered about 63% of the way. Newton's second law, force equals mass times acceleration, is the differential equation behind every moving robot ([[F5]]).

Some differential equations have a neat formula for their solution, like the motor's. Most of a robot's don't, so a computer follows them step by step.

## One step at a time

Euler's method is the simplest way. From where you are, work out the slope, follow it for a short [[~time-step|time step]] h, and repeat. The steps make a chain of straight segments that approximates the true curve, and for small steps the error shrinks roughly in proportion to the step.[@euler-method] Smaller steps are more accurate, but you need more of them. A step that is too large can do worse than be inaccurate: it can overshoot, and then swing wider and wider.

Physics engines face this choice at every step. MuJoCo, the engine behind this atlas's simulations, moves forward by a fixed time step of 2 ms unless told otherwise. Its documentation calls the time step the most important setting for trading speed against accuracy, and it offers several methods for taking each step, from a semi-implicit Euler method to a fourth-order Runge-Kutta method.[@mujoco-timestep]

## Try it: Euler steps {#try}

<euler-demo>
<p class="demo-nojs">This demo needs JavaScript: a motor's speed rising towards its final value, worked out exactly and in Euler steps of a size you choose.</p>
</euler-demo>

What to try:

- **Small step.** The steps hug the curve, and the largest error is small.
- **Halve the step** with the slider: the error roughly halves too.
- **h = τ.** The first step lands exactly on the final speed: the starting slope, followed for one τ, gets there in one go.
- **Between τ and 2τ.** Each step overshoots the final speed and the next corrects too far the other way, a little less each time.
- **Too big.** Past 2τ the overshoots grow instead of shrinking. The method is unstable, even though the motor itself is perfectly calm.

<details class="deeper">
<summary>Go deeper: the equations</summary>

Velocity is the derivative of position, approximately a small change over a small time, and the distance covered is the integral of velocity:

$$
v(t) = \frac{dx}{dt} \approx \frac{x(t + \Delta t) - x(t)}{\Delta t}
$$

$$
x(t_2) - x(t_1) = \int_{t_1}^{t_2} v(t)\,dt
$$

The motor's speed $v$ approaches its final speed $V$ as

$$
\frac{dv}{dt} = \frac{V - v}{\tau}, \qquad v(t) = V\left(1 - e^{-t/\tau}\right)
$$

so after one time constant, $v(\tau) = V(1 - e^{-1}) \approx 0.63\,V$.

Euler's method with step $h$ gives $v_{k+1} = v_k + h\,(V - v_k)/\tau$. The gap to the final speed, $g_k = V - v_k$, is multiplied by the same factor at every step:

$$
g_{k+1} = \left(1 - \frac{h}{\tau}\right) g_k
$$

It shrinks when $|1 - h/\tau| < 1$, that is when $h < 2\tau$; it changes sign at each step, overshooting, when $h > \tau$; and when $h \ge 2\tau$ it never shrinks. Whether the method is stable depends on the step, not only on the system.

</details>

## Common mistakes

- Taking the derivative of a noisy signal without filtering it first.
- Adding up a rate that has a small constant error: the total drifts further and further.
- Choosing a time step for speed without checking that the result still holds when the step is halved.
- Mixing up a quantity and its rate: position and velocity, charge and current.

## Where it leads

[[F4]] uses derivatives to find the best answer, [[F5]] turns forces into motion, [[M4]] writes a robot's motion as differential equations, and [[M5]] closes control loops around them.
