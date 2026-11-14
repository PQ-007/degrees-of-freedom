---
title: "Optimization"
summary: "Cost functions, gradients, least squares, constraints and local minima: the maths of finding the best answer."
---

## Why a robot needs it

Many robot problems are a search for the best: the joint angles that put a gripper on a cup ([[M3]]), the motor commands that follow a path with the least effort ([[M7]]), the map that best explains every scan ([[P9]]), the settings of a neural network that make the fewest mistakes ([[P6]]). Optimization is the maths of finding the best, and the same few ideas run through all of them.

## Cost functions

First, write down what "best" means as a single number that is small when things are good: a [[~cost-function|cost function]]. For fitting a line through noisy points, a good cost is the sum of the squared distances between the line and the points. Choosing the cost is half the work, because the optimizer delivers exactly what the cost asks for: if it doesn't charge for energy, the answer won't save any.

## Gradients and gradient descent

Picture the cost as a landscape over every possible answer, with valleys where the answers are good. The gradient at any point is the direction in which the ground rises fastest. [[~gradient-descent|Gradient descent]] walks the other way, one step at a time: work out the gradient, step against it by an amount set by the step size (often called the learning rate), and repeat.[@gradient-descent] It's the same trade as the time steps in [[F2]]: tiny steps creep, and steps that are too big overshoot, zigzag across the valley, or bounce out of it altogether.

## Least squares

Making the sum of squared errors as small as possible is called [[~least-squares|least squares]].[@least-squares] When the model is a straight line, or anything else that depends linearly on its unknowns, there's no need to step at all: a direct formula, from the normal equations, gives the best answer in one go.[@least-squares] Robots use it to calibrate sensors, to fit lines and planes to points, and as the inner step of larger problems that aren't linear.

## Constraints

Real problems have limits. Joints only turn so far, motors only push so hard, and the robot must not pass through a wall. A constrained problem asks for the best answer among those that obey every limit: minimize the cost, subject to the constraints.[@convex-optimization] This is how predictive controllers plan motor commands that respect the motors' limits ([[M7]]).

## Local minima

Not every cost is a single bowl. Gradient descent finds the bottom of the valley it starts in, which may be a [[~local-minimum|local minimum]]: lower than everything near it, but not the lowest overall.[@gradient-descent] Some problems are free of this trap. In a convex problem, such as least squares, every local minimum is also the lowest point.[@convex-optimization] For the rest, a good starting guess matters, and so does trying more than one.

![A curve of a cost J over a variable θ, with two valleys: a shallow one on the left, marked A, and a deeper one on the right, marked B. Two hollow circles sit high on the slopes; a dashed arrow from the left one curves down into valley A, and one from the right curves down into valley B, where filled dots rest at the bottoms.](fig:two-valleys "Descent rolls into the valley it starts in: from the left it stops at A, a local minimum; only from the right does it reach B, the lowest point.")

## Try it: calibrating a sensor {#try}

<fit-demo>
<p class="demo-nojs">This demo needs JavaScript: gradient descent fitting a calibration line through twelve sensor readings, with the cost landscape and the path of each step.</p>
</fit-demo>

The sensor reads about 10% short with a small offset, and the best line corrects it. The valley is long and narrow: raise the slope a while lowering the offset b, and the line still passes near the points, so the cost hardly changes along that direction; across it, the cost climbs steeply.

What to try:

- **Good: 0.2.** The steps head straight down the steep sides, then slide along the valley floor to the cross.
- **Small: 0.05.** The same path, but it creeps: 20 steps get only partway.
- **Zigzag: 0.35.** Each step overshoots across the narrow valley, but the zigzags shrink.
- **Too big: 0.45.** The overshoots grow, and the cost climbs instead of falling.
- **1 step at a time.** Watch the line on the left swing into place as the dot on the right moves downhill.

<details class="deeper">
<summary>Go deeper: the equations</summary>

The cost of the line $y = a x + b$ on $N$ points is the mean squared error

$$
J(a, b) = \frac{1}{N} \sum_{i=1}^{N} \left(a x_i + b - y_i\right)^2
$$

Gradient descent with step size $\eta$ updates both together:[@gradient-descent]

$$
\begin{bmatrix} a \\ b \end{bmatrix} \leftarrow \begin{bmatrix} a \\ b \end{bmatrix} - \eta \, \nabla J(a, b)
$$

In matrix form, with the unknowns $\theta = (a, b)$, least squares minimizes $\lVert A\theta - y \rVert^2$, and its answer solves the normal equations:[@least-squares]

$$
A^\top A \, \theta = A^\top y
$$

Because $J$ is a bowl with constant curvature, each step multiplies the distance to the best $\theta$ by $(I - \eta H)$, where $H$ is the matrix of second derivatives. Descent settles only if $\eta < 2 / \lambda_{\max}$, with $\lambda_{\max}$ the larger eigenvalue of $H$, the steepest direction of the valley. A long, narrow valley has one large and one small eigenvalue: the large one limits the step, and the small one makes progress along the floor slow.

</details>

## Common mistakes

- Optimizing a cost that doesn't say what you actually want.
- Choosing a step size without checking that the cost keeps falling.
- Unknowns on very different scales, which make long, narrow valleys and slow zigzags. Rescaling them helps.
- Trusting one run of a problem with many valleys.

## Where it leads

[[M3]] solves for joint angles, [[M7]] plans the best commands over a short horizon, [[P9]] fits a whole map to every measurement, and [[I9]] learns by optimizing a reward.
