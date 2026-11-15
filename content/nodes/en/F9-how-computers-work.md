---
title: "How computers work"
summary: "CPU, memory, input and output, interrupts and operating systems."
---

## Why a robot needs it

A robot's code from [[F8]] runs on real chips with limits: so many numbers a second, so many bytes of memory, so many steps in a sensor reading. Knowing what happens underneath tells you why a counter suddenly jumps to zero, why a reading is a little off, and why a program on Linux sometimes answers late.

## Bits and numbers

A computer stores everything as [[~bit|bits]], each a 0 or a 1. One bit has two values, two bits have four, and n bits have 2ⁿ: 8 bits give 256 numbers, 16 bits give 65,536. Binary writes numbers with those two digits, so 1011 is 8 + 2 + 1 = 11.

Because the number of bits is fixed, numbers have limits:

- **Whole numbers wrap around.** In C++, unsigned arithmetic is done modulo 2ⁿ: add one to the largest value and you get 0. If a signed number overflows, C++ doesn't say what happens at all.[@cpp-overflow] An encoder counter that runs long enough will do this.
- **Fractions are close, not exact.** Most decimal fractions have no exact binary form: 0.1 is stored as a very near number, so 0.1 + 0.1 + 0.1 == 0.3 comes out false.[@python-float] Never compare such numbers with ==.

## The processor

The processor, or CPU, runs instructions one after another from memory. Each goes through the same steps: fetch it, decode what it asks for, execute it; a small microcontroller core such as the Cortex-M3 does exactly these three stages.[@cortex-m3-pipeline] A clock sets the pace. The chip on an Arduino UNO runs at up to 16 MHz;[@arduino-uno-r3] the Raspberry Pi 5's clock runs at 2.4 GHz, 150 times as fast.[@raspberry-pi-5]

![A block diagram. On the left a square wave, the clock, is joined to a box marked CPU. From the CPU a line runs down to a long horizontal line, the bus, and from the bus three lines run down to boxes marked RAM, Flash and I/O. Below the I/O box, pins lead to a round sensor. A dashed line in the accent colour runs from the I/O box up the right side and into the CPU, ending in an arrow: an interrupt.](fig:computer-blocks "A computer as blocks: a clock paces the CPU, and a bus joins it to memory (RAM and flash) and to the input and output pins. The dashed line is an interrupt: a pin signalling the CPU directly.")

## Memory

Memory comes in two kinds. RAM is fast and holds the working values, such as the variables in a program, but it forgets everything when the power goes off. Flash keeps its contents without power, so the [[~firmware|firmware]] is stored there and runs from it at power-up.[@arduino-memory]

The sizes range widely. An Arduino UNO has 32 kB of flash and 2 kB of RAM;[@arduino-uno-r3] a Raspberry Pi 5 has 1 to 16 GB of RAM, hundreds of thousands to millions of times more.[@raspberry-pi-5] On a small chip, every array and string counts.

## Input and output

The processor reaches the world through its pins. A digital pin reads or writes a 0 or a 1. A sensor that gives a voltage needs an [[~adc|ADC]], an analog-to-digital converter, which turns the voltage into a number. An Arduino's ADC has 10 bits: it turns 0 to 5 V into a number from 0 to 1023, and one reading takes about 100 microseconds.[@arduino-analogread] Bigger messages go over buses to other chips ([[C12]]).

## Try it: from a voltage to a number {#try}

<adc-demo>
<p class="demo-nojs">This demo needs JavaScript: a sensor's voltage between 0 and 5 V, turned into a number by a converter with 1 to 12 bits, with the reading in binary.</p>
</adc-demo>

What to try:

- **3 bits.** Only 8 readings: the staircase barely follows the curve.
- **One bit more.** Each extra bit doubles the number of steps and halves their size.
- **10 bits,** like an Arduino. 1024 steps of about 5 mV: the staircase lies on the curve, and the binary reading has ten digits.

## Interrupts

A program can check a pin over and over, but it may miss a short pulse while it is busy elsewhere. An [[~interrupt|interrupt]] lets the hardware stop the processor, run a short function called a handler, and go back to where it was. Arduino suggests interrupts for reading a rotary encoder; the handler should be as short and fast as possible, `delay()` doesn't work inside it, and variables it changes should be marked `volatile`.[@arduino-interrupts]

```cpp
volatile long count = 0;   // changed inside the handler

void onPulse() {           // the handler: short and fast
  count++;
}

void setup() {
  attachInterrupt(digitalPinToInterrupt(2), onPulse, RISING);
}
```

Each pulse from the encoder on pin 2 adds one to `count`, whatever `loop()` is doing at that moment.

## Operating systems

An [[~operating-system|operating system]] runs many programs on one processor. Only one task runs at any moment; a scheduler decides which runs next and saves each task's place when it switches.[@freertos-scheduler]

On ordinary Linux, an urgent task can wait a while before it gets to run; the PREEMPT_RT version cuts that wait.[@linux-preempt-rt] On microcontrollers, a real-time operating system gives tasks strict priorities and always runs the most urgent one that is ready, so its timing can be predicted.[@freertos-scheduler] That is what [[~real-time|real-time]] means: an answer that comes late is a wrong answer.

<details class="deeper">
<summary>Go deeper: the equations</summary>

How many numbers n bits can hold:

$$
L = 2^{n}
$$

An ADC with reference voltage $V_\text{ref}$ splits it into steps of:[@arduino-analogread]

$$
\Delta = \frac{V_\text{ref}}{2^{n}}
$$

and reports which step the voltage $v$ is in:

$$
k = \left\lfloor \frac{v}{\Delta} \right\rfloor
$$

so the reading is up to one step below the true value:

$$
0 \le v - k\,\Delta < \Delta
$$

Unsigned n-bit arithmetic wraps around:[@cpp-overflow]

$$
(a + b) \bmod 2^{n}
$$

</details>

## Common mistakes

- Comparing fractions with ==, when they can differ in the last digit.[@python-float]
- Letting a counter overflow: pick a type with enough bits for the longest run.
- Doing slow work in an interrupt handler, or forgetting `volatile` on the variables it shares.[@arduino-interrupts]
- Expecting exact timing from a program on ordinary Linux.

## Where it leads

[[C11]] compares the chips and computers a robot can use, and [[C12]] covers the buses and links between them.
