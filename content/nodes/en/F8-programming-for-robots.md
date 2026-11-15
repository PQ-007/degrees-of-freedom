---
title: "Programming for robots"
summary: "C and C++ for firmware, Python for scripts and machine learning, Linux, the terminal and git."
---

## Why a robot needs it

Past the wiring, everything a robot does is code: reading sensors, deciding, driving motors. A robot usually runs code in more than one place, and each place has a language that suits it. You don't need them all on day one, but you should know which goes where.

## Where each language runs

![A map drawn from top to bottom. A laptop, labelled Python and MATLAB, is joined by a dashed line, the network, to a circuit board with a processor, a row of pins and two ports, labelled Linux, C++ and Python, and ROS 2. A solid wire joins the board to a small chip with legs, labelled C and C++, and a thin wire joins the chip to a motor.](fig:languages-map "Where each language runs: Python and MATLAB on your laptop, Linux with C++ and Python on the robot's computer, and C or C++ on the microcontroller that drives the motor.")

- **On the microcontroller:** [[~firmware|firmware]] in C or C++, which starts at power-up and works the pins directly.
- **On the robot's computer:** Linux, with programs in C++ and Python that talk through [[S2]]. Nodes written in the two languages share messages.[@ros2-client-libraries]
- **On your laptop:** Python to train models and look at data, and tools that model and simulate a robot before it is built.

## C and C++: close to the hardware

A [[~compiler|compiler]] turns C and C++ into the processor's own instructions before they run, so a [[~microcontroller|microcontroller]] runs them directly. An Arduino sketch is turned into a C++ program and compiled with gcc and g++.[@arduino-sketch-cpp]

A sketch has two parts: `setup()` runs once, after each power-up or reset, and `loop()` then runs over and over.[@arduino-setup-loop] Here a robot stops when its front bumper is pressed: sense, think, act, many times a second.

```cpp
const int BUMPER = 2;  // a switch on the front
const int MOTOR = 9;   // a PWM pin to the motor driver

void setup() {         // once, at power-up
  pinMode(BUMPER, INPUT_PULLUP);
  pinMode(MOTOR, OUTPUT);
}

void loop() {          // over and over
  bool hit = digitalRead(BUMPER) == LOW;  // sense
  int duty = hit ? 0 : 127;               // think
  analogWrite(MOTOR, duty);               // act
}
```

`INPUT_PULLUP` holds the pin high until the switch joins it to ground, so a press reads `LOW`. `analogWrite` is the [[~pwm|PWM]] from [[F7]]: 127 out of 255 is about half the time on.[@arduino-pwm]

## Python: quick to write

Python needs no separate build step: change a program and run it again straight away. That is why it suits tools and quick trials, while the parts that must be efficient are often written in C++.[@ros2-client-libraries] Widely used machine learning tools are built for it too.[@pytorch]

This ROS 2 node listens to a distance sensor and warns when something is close. A node is one small program; ROS 2 carries messages between nodes.

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Range

class Watch(Node):
    def __init__(self):
        super().__init__("watch")
        self.create_subscription(
            Range, "front_range", self.on_range, 10)

    def on_range(self, msg):
        if msg.range < 0.2:  # metres
            self.get_logger().info("Obstacle ahead")

rclpy.init()
rclpy.spin(Watch())
```

`create_subscription` asks for every message on the `front_range` topic, and `spin` keeps the program waiting for them, calling `on_range` for each one.

## Linux and the terminal

The robot's computer often runs Linux: Ubuntu, a Linux, is one of the platforms ROS 2 supports best.[@ros2-jazzy-platforms] It often has no screen, so you work on it from your laptop, typing commands into a terminal. The commands are short and do one thing each:

```sh
ssh me@rover.local    # log in to the robot over the network
cd rover              # go into the project folder
ls                    # list what is there
python3 watch.py      # run the program
```

Typed commands can be saved in a file and run again exactly, which is harder with clicks.

## Git: every version kept

[[~version-control|Version control]] keeps every saved version of a project, with who changed what and why. Git is a free, open-source version control system.[@git-vcs] When a change stops the robot from driving, you can see exactly what changed and go back.

```sh
git add watch.py
git commit -m "Warn when an obstacle is close"
git log --oneline     # the saved versions, newest first
```

A commit is one saved version. Commit small steps, each with a message saying why, and a working robot is never more than one step back.

## Other languages you'll meet

- **Rust** compiles like C++ but checks how memory is used before the program runs, which removes many kinds of bugs; it has no garbage collector, so it can run on small devices.[@rust-safety]
- **Block diagrams.** Some tools let you draw a system as connected blocks, simulate it, and generate the code for the hardware from the drawing.[@simulink]

<aside class="examples" aria-label="Real examples">

**Real examples** · checked 15 November 2026

- **Arduino:** sketches are C++, compiled with gcc and g++.[@arduino-sketch-cpp]
- **Raspberry Pi Pico:** its official SDK is for C and C++.[@pico-sdk]
- **PyTorch:** a machine learning framework made for Python.[@pytorch]
- **Simulink (MathWorks):** block diagrams that are simulated, then turned into code for embedded systems.[@simulink]

</aside>

## Common mistakes

- Waiting inside `loop()`, for example with a long `delay()`: while it waits, the robot stops reading its sensors.
- Writing the fast inner loop in Python on the robot's computer, when it belongs in the firmware or in C++.
- Changing working code with no commit to go back to.
- Mixing units without saying which: write metres, seconds and radians beside the numbers, as in the code above.

## Where it leads

[[F9]] shows what the computer does with this code, [[S2]] builds whole robots from nodes, and [[I1]] and [[I4]] plan paths and tasks in code.
