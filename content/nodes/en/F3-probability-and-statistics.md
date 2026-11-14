---
title: "Probability and statistics"
summary: "Noise, the mean and the spread, the bell curve, averaging, and Bayes' rule: the maths of not being sure."
---

## Why a robot needs it

No sensor reading is exact, and nothing goes exactly to plan. Probability is the maths of not being sure; statistics turns many uncertain numbers into a useful one. Robots use both all the time: to filter out sensor noise, to know how far to trust a measurement, and to decide whether an obstacle is really there.

## Noise, the mean and the spread

Point a distance sensor at a wall 2 m away and take a few readings: 2.03, 1.98, 2.01, 1.96. They scatter around the true distance, and that scatter is [[~noise|noise]]. Two numbers sum up a pile of readings. The [[~mean|mean]] is their average, where they centre. The [[~standard-deviation|standard deviation]], written σ, measures how far they typically lie from the mean.[@sd-empirical]

## The bell curve

Many measurements scatter in a bell shape, the [[~normal-distribution|normal or Gaussian distribution]]. For bell-shaped data, about 68% of the values lie within one standard deviation of the mean, about 95% within two, and more than 99% within three.[@sd-empirical] So a sensor with σ = 1 cm reads within 2 cm of the truth about 19 times out of 20.

![A bell-shaped curve over a horizontal axis marked μ−2σ, μ−σ, μ, μ+σ and μ+2σ, with a dashed line up the middle at μ. The area under the curve between μ−σ and μ+σ is shaded darker and labelled about 68%; the wider area between μ−2σ and μ+2σ is shaded lighter, with a bracket above it labelled about 95%.](fig:bell-curve "The bell curve: about 68% of values lie within one standard deviation σ of the mean μ, and about 95% within two.")

## Averaging

Averaging readings beats noise. The average of n readings still centres on the true value, but its spread shrinks to σ/√n: four readings halve the noise, and a hundred cut it to a tenth. However the noise is shaped, the average of many readings comes out close to bell-shaped.[@clt-sem]

There are two catches. Averaging takes time: n readings take n times as long, and a robot reacting to a moving world can't always wait. And averaging can't remove a bias: if a sensor always reads 3 cm long, so does the average of a thousand readings.

## Bayes' rule

"How likely is an alarm, if a person is there?" and "How likely is a person, if there's an alarm?" are different questions with different answers. [[~bayes-rule|Bayes' rule]] turns one into the other, using how common the thing was to begin with, its base rate.[@bayes-base-rate]

An example with made-up numbers: a robot's camera detector says "person" 95% of the time when someone is in the aisle and 2% of the time when nobody is. People are in this aisle 1 time in 100. When it says "person", is someone there? Only about 1 time in 3: there are so many empty-aisle moments that the rare false alarms add up to more than the real detections. With a rare event, even an accurate detector's alarms are mostly false.[@bayes-base-rate]

Robots use Bayes' rule constantly. Each new measurement updates what they believe, the way a [[~state-estimate|state estimate]] is kept in [[P1]].

## Try it: averaging noisy readings {#try}

<noise-demo>
<p class="demo-nojs">This demo needs JavaScript: many readings of a wall 2 m away, single readings against averages, with the noise and the number of readings averaged set by you.</p>
</noise-demo>

What to try:

- **N = 1.** Averages of one reading are just single readings: the two histograms match.
- **N = 4.** The averages' spread halves. Compare it with what σ/√N predicts.
- **N = 25.** The spread falls to a fifth, but each average now takes half a second.
- **Double the noise.** Both spreads double.
- **New readings.** A fresh set of random readings: the numbers move a little, the pattern doesn't.

<details class="deeper">
<summary>Go deeper: the formulas</summary>

For readings $x_1, \dots, x_n$, the mean and the standard deviation are

$$
\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i
$$

$$
s = \sqrt{\frac{1}{n-1}\sum_{i=1}^{n} (x_i - \bar{x})^2}
$$

The normal distribution with mean $\mu$ and standard deviation $\sigma$ is

$$
p(x) = \frac{1}{\sigma\sqrt{2\pi}}\, e^{-(x-\mu)^2 / (2\sigma^2)}
$$

and the average of $n$ independent readings spreads by $\sigma_{\bar{x}} = \sigma / \sqrt{n}$.[@clt-sem]

Bayes' rule, for a thing $A$ and evidence $B$:[@bayes-base-rate]

$$
P(A \mid B) = \frac{P(B \mid A)\, P(A)}{P(B)}
$$

where

$$
\begin{aligned}
P(B) = {} & P(B \mid A)\, P(A) \\
& + P(B \mid \text{not } A)\, P(\text{not } A)
\end{aligned}
$$

With the detector's numbers:

$$
\frac{0.95 \times 0.01}{0.95 \times 0.01 + 0.02 \times 0.99} \approx 0.32
$$

</details>

## Common mistakes

- Treating a single reading as the truth.
- Expecting averaging to remove a bias. It only removes the scatter.
- Confusing P(alarm | person) with P(person | alarm).
- Averaging readings that share the same error, such as ones taken too close together, and expecting the full √n improvement.

## Where it leads

[[P1]] keeps a robot's best guess of its state and how sure it is, [[P2]] does it with bell curves, [[P3]] does it with many samples, and [[F4]] finds the line that best fits noisy points.
