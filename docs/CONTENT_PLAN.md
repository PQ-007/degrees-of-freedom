# Degrees of Freedom: Content Plan

Draft 2, 2026-11-14. Replaces draft 1 (a single-robot build course). This covers content only; the site build comes later. Update this file when a decision changes.

*There is no single way to build a robot. A humanoid, a quadruped and a Mars rover are built from the same building blocks, picked and combined differently for different jobs. This course maps those blocks, shows them side by side, and shows how they connect.*

**The name:** in robotics, a degree of freedom (DOF) is one independent way a robot can move: a joint that turns, a slide that extends. It is also the site's idea: there is no single path through robotics, so the learner chooses their own route through the tree. "DOF" is the short form.

## 1. What it is

Building a computer follows one path: gates → ALU → CPU → OS. Robots don't. What you need depends on the robot: a rover needs power for years and autonomy across a 20-minute radio delay; a humanoid needs high-torque joints and balance at 1 kHz; a drone needs every gram to count.

So Degrees of Freedom is a **structured atlas of robotics** with a learning path through it. It answers four questions:

1. **What is robotics, and what do I need to know?** → Foundations + the Tech Tree.
2. **What are my options for each part?** (motors, controllers, power, sensors, compute, software) → Compare pages, side by side.
3. **How does it all connect?** (sensor → software → algorithm → driver → motor) → The Signal Chain.
4. **How are real robots built, and how do I start building one?** → Robot teardowns, Roadmaps per robot type, a ladder of Builds.

Each part has docs (reading), interactive demos (trying), and optional real Builds (building).

### Sitemap

```text
Home
├── Start here: what robotics is, how to use this site
├── Foundations (Tier 0)             ← required base for everything
├── Tech Tree                        ← every topic as a node with prerequisites
│     tiers 1–6, each node a doc page
├── The Signal Chain                 ← one end-to-end walk: sensor → … → motor
├── Compare                          ← side-by-side tables (motors, drivers,
│                                       compute, power, sensors, buses, control,
│                                       estimators, planners, software, sims, RL)
├── Robots                           ← teardowns of robot types (humanoid,
│                                       quadruped, rover, drone, arm, ...)
├── Roadmaps                         ← "I want to build X": a highlighted path
│                                       through the tree + builds
├── Builds                           ← a ladder of real builds, easy → hard
└── Glossary · Sources
```

### Three ways in

- **By topic:** walk the Tech Tree tier by tier (a structured course).
- **By robot:** pick a robot type → its teardown → its roadmap lights up the nodes you need.
- **By question:** "which motor should I use?", "how does the RL policy reach the motor?" → Compare pages and the Signal Chain.

## 2. The Tech Tree

Tiers go from fundamentals up. A node lists its prerequisites; a learner can mark nodes as learned and see what unlocks. IDs are working names.

```text
Tier 6  Systems & the real world   ── integration, testing, safety, deployment
Tier 5  Intelligence               ── planning, locomotion, manipulation, learning
Tier 4  Perception & estimation    ── filters, vision, SLAM, sensor fusion
Tier 3  Motion & control           ── kinematics, dynamics, PID → MPC → WBC
Tier 2  Low-level integration      ── firmware, motor control, sensor interfacing
Tier 1  Components                 ── mechanics, actuators, power, sensors, compute, buses
Tier 0  Foundations                ── what robotics is, math, physics, electronics, programming
```

Short form below, a few lines per node. Every node page uses the template in §7.

### Tier 0 — Foundations

| ID | Node | Covers |
|---|---|---|
| F0 | What is robotics | Definition (sense–think–act loop); robot vs machine vs automaton; anatomy of any robot (body, actuators, power, sensors, compute, comms, software); the disciplines robotics joins; kinds of robots; levels of autonomy; history timeline (cited); why it's hard (Moravec's paradox); **how to use this map** |
| F1 | Math I: geometry and linear algebra | Units, trigonometry, radians, vectors, matrices, coordinate frames, rotations |
| F2 | Math II: calculus and differential equations | Rates of change, integration, ODEs as "how things evolve", numerical steps |
| F3 | Math III: probability and statistics | Mean, variance, Gaussians, Bayes' rule, noise |
| F4 | Math IV: optimization | Cost functions, gradients, least squares, constraints (used by IK, MPC, learning, SLAM) |
| F5 | Physics: mechanics | Newton's laws, force, torque, inertia, friction, energy, power, momentum |
| F6 | Physics: electromagnetism | Charge, current, fields, induction: why motors and sensors work |
| F7 | Electronics basics | Voltage, current, resistance, Ohm's law, power, components (R, C, L, diode, transistor/MOSFET), reading schematics and datasheets, breadboard and multimeter, safety |
| F8 | Programming for robots | C/C++ (firmware, performance), Python (scripting, ML), Linux and the terminal, git; what Rust and MATLAB/Simulink are used for |
| F9 | How computers work | CPU, memory, I/O, interrupts, operating systems (links to Sand to Tetris) |

### Tier 1 — Components (the hardware building blocks)

| ID | Node | Covers | Compare page |
|---|---|---|---|
| C1 | Mechanisms and structure | Links, joints, DOF, workspace, stiffness, materials (aluminium, steel, carbon fibre, plastics), fabrication (3D printing, CNC, laser cutting), CAD | — |
| C2 | Transmissions | Gear ratio (torque ↔ speed), spur/planetary, harmonic (strain-wave), cycloidal, belts, ball/lead screws, cables/tendons, direct drive; backlash, backdrivability, efficiency | X2 |
| C3 | Locomotion mechanisms | Wheels (differential, Ackermann, omni, mecanum, rocker-bogie), tracks, legs, propellers/rotors, fins/thrusters | X3 |
| C4 | Electric motors | Brushed DC, gearmotor, stepper, brushless (BLDC/PMSM; inrunner/outrunner), coreless, linear motors; torque constant, back-EMF, torque–speed curve, heat | X1 |
| C5 | Actuator packages | Hobby servo, smart bus servo, quasi-direct-drive (QDD) actuator, harmonic-drive joint, series elastic actuator (SEA), linear actuator | X1 |
| C6 | Fluid and other actuators | Hydraulics (power density, pumps, valves), pneumatics, artificial muscles (McKibben, SMA, dielectric elastomers), soft actuators | X1 |
| C7 | Power sources | Battery chemistries (alkaline, NiMH, Li-ion, LiPo, LiFePO4), capacity, C-rate, energy density; tethers; solar; fuel cells; engines/hydraulic power units; radioisotope generators (RTG) | X4 |
| C8 | Power electronics and distribution | Voltage rails (5/12/24/48 V), regulators (linear vs switching), BMS, fuses, e-stop, power distribution, regenerative braking, common ground, EMI | X4 |
| C9 | Sensors: proprioceptive | Encoders (incremental, absolute, magnetic, optical), potentiometers, current sensing, IMU (accel, gyro, magnetometer), joint torque, force-torque sensors | X5 |
| C10 | Sensors: exteroceptive | Bumpers, ultrasonic, IR, ToF, 2D/3D lidar, radar, cameras (mono, stereo, depth, event), GNSS/RTK, tactile skin, microphones | X5 |
| C11 | Compute hardware | 8-bit MCU, 32-bit MCU (ARM Cortex-M class), DSP, FPGA, single-board computer, embedded GPU/AI module, industrial PC, PLC, radiation-hardened processors | X6 |
| C12 | Communication buses and links | UART, I²C, SPI, CAN/CAN-FD, RS-485, EtherCAT, Ethernet, USB; wireless (Wi-Fi, Bluetooth, LoRa, RC radio, telemetry, cellular, deep-space links) | X7 |

### Tier 2 — Low-level integration (making the hardware alive)

| ID | Node | Covers |
|---|---|---|
| L1 | Embedded firmware | GPIO, ADC, PWM, timers, interrupts, DMA; superloop vs RTOS tasks; fixed-rate loops and jitter; watchdogs; bootloaders and flashing |
| L2 | Real-time systems | Hard vs soft deadlines, loop rates, latency budgets, RTOS (FreeRTOS, Zephyr), real-time Linux, why the motor loop never runs in Python |
| L3 | Motor drivers | H-bridge, MOSFET gate drivers, stepper drivers, ESCs, PWM frequency, dead time, shoot-through, current limiting, thermal limits |
| L4 | Motor control | Commutation (brushed vs six-step vs FOC), current (torque) loop, velocity loop, position loop, cascaded loops, encoder calibration, the driver's "modes" (current/velocity/position/PD) |
| L5 | Sensor interfacing and signal processing | Signal conditioning, sampling, Nyquist and aliasing, quantization, debouncing, filtering (moving average, low-pass), calibration (offset, scale, axis alignment), timestamps and synchronization |
| L6 | Device communication | Talking to drivers and sensors over buses: registers, packets, checksums, addressing, bus timing, a bus of 12 joints at 1 kHz |
| L7 | Safety layer in hardware | E-stop chains, brakes, limit switches, current/thermal protection, safe torque off, fault states |

### Tier 3 — Motion and control

| ID | Node | Covers |
|---|---|---|
| M1 | Frames and transforms | Poses, rotation matrices, homogeneous transforms, Euler angles and gimbal lock, quaternions, transform trees |
| M2 | Kinematics: mobile | Differential drive, Ackermann, omni/mecanum, rocker-bogie; nonholonomic constraints; odometry and drift |
| M3 | Kinematics: arms and legs | Forward kinematics, DH parameters, workspace; inverse kinematics (analytic, numeric/Jacobian), singularities, redundancy; legs as arms that touch the ground |
| M4 | Dynamics | Equations of motion, inertia, gravity, Coriolis; Newton–Euler and Lagrange; floating-base dynamics (legged robots, drones); contact |
| M5 | Classical control | Open vs closed loop, bang-bang, PID, step response, stability, tuning, anti-windup, feedforward, cascade control, discrete-time control |
| M6 | Modern control | State space, controllability, LQR, observers, robust control (overview) |
| M7 | Optimal and predictive control | Trajectory optimization, Model Predictive Control (MPC), convex MPC for legged robots |
| M8 | Force and interaction control | Impedance/admittance control, compliance, hybrid force-position, backdrivability's role, safe contact with people |
| M9 | Whole-body control | Many joints, many tasks (balance, reach, look) at once; task priorities; quadratic-program controllers; humanoids and quadrupeds |
| M10 | Trajectory generation | Point-to-point profiles (trapezoid, S-curve), splines, time-parametrization, joint vs Cartesian space |
| M11 | Flight and vehicle control | Multirotor attitude/rate loops, mixing, thrust; car-like path tracking; underwater thrust allocation |

### Tier 4 — Perception and estimation

| ID | Node | Covers |
|---|---|---|
| P1 | State estimation basics | Belief, uncertainty, combining measurements, complementary filter |
| P2 | Kalman filters | KF, EKF, UKF; process vs measurement noise; tuning; divergence |
| P3 | Particle filters | Monte Carlo localization, multimodal beliefs |
| P4 | Sensor fusion in practice | IMU + encoders + vision/lidar; legged-robot state estimation (leg odometry + IMU); visual-inertial odometry; time sync |
| P5 | Computer vision | Pinhole model, calibration, color, filtering/edges, features, fiducial markers, optical flow |
| P6 | Learned perception | CNNs and transformers for detection/segmentation/pose; datasets; failure modes |
| P7 | 3D perception | Stereo, depth cameras, point clouds, registration (ICP), terrain mapping |
| P8 | Mapping | Occupancy grids, elevation maps, feature maps, topological maps |
| P9 | SLAM | The problem, scan matching, loop closure, graph/factor-graph SLAM, visual SLAM |

### Tier 5 — Intelligence (deciding and doing)

| ID | Node | Covers |
|---|---|---|
| I1 | Path planning | Configuration space, graph search (BFS, Dijkstra, A*, D* Lite), grids |
| I2 | Motion planning | Sampling-based (PRM, RRT, RRT*), optimization-based planning, collision checking |
| I3 | Local navigation | Obstacle avoidance, potential fields, dynamic window, path following (pure pursuit, Stanley) |
| I4 | Task planning and behavior | State machines, behavior trees, task planners, mission planning |
| I5 | Wheeled and tracked navigation | Indoor AMR stacks, outdoor terrain, the full navigation pipeline |
| I6 | Legged locomotion | Static vs dynamic stability, support polygon, ZMP, capture point, gaits, footstep planning, contact scheduling, MPC + whole-body control, RL locomotion |
| I7 | Aerial autonomy | Flight modes, waypoint missions, visual navigation, GPS-denied flight |
| I8 | Manipulation | Grippers and hands, grasp planning, pick-and-place pipeline, dexterous manipulation, mobile manipulation |
| I9 | Reinforcement learning | MDPs, rewards, policies, value functions, PPO/SAC (intuition), reward design and hacking, massively parallel simulation |
| I10 | Imitation learning | Teleoperation and demonstration data, behavior cloning, diffusion policies (overview) |
| I11 | Sim-to-real | Reality gap, domain randomization, system identification, actuator modelling |
| I12 | Foundation models in robotics | Vision-language-action models, language for task specification; what works today and what doesn't (dated, cited) |
| I13 | Multi-robot and swarms | Coordination, task allocation, swarm behavior |
| I14 | Human–robot interaction | Teleoperation interfaces, shared autonomy, social robots, communicating intent |

### Tier 6 — Systems and the real world

| ID | Node | Covers |
|---|---|---|
| S1 | Robot software architecture | Layers and loop rates, nodes and messages, publish/subscribe, services/actions, where each part runs (MCU vs computer vs cloud) |
| S2 | ROS 2 | Nodes, topics, services, actions, parameters, tf2, launch, bags, URDF; Nav2, MoveIt, ros2_control; micro-ROS on microcontrollers |
| S3 | Simulation | How physics engines work (integration, contacts), robot description files (URDF/MJCF/SDF), simulators side by side, digital twins, hardware-in-the-loop |
| S4 | Testing and debugging | Logging, plotting, replay, unit/sim/hardware tests, oscilloscope and logic analyzer, a symptom → cause guide |
| S5 | Reliability and operations | Fault detection, recovery, degraded modes, remote updates, fleets, long-duration autonomy |
| S6 | Teleoperation and remote operation | Latency, bandwidth, supervisory control; extreme case: Mars (minutes of delay, commands sent as daily plans) |
| S7 | Safety, standards and ethics | Risk assessment, e-stops, collaborative robots, safety standards (named and cited), ethics (jobs, privacy, autonomy, military) |
| S8 | Design process | Requirements → architecture → component selection → prototype → test → iterate; trade-off studies; cost and weight budgets |

## 3. The Signal Chain: how it actually connects

The center of the site: one long page, plus an interactive diagram, that follows a single moment of a robot's life from the world into the robot and back out. It answers "how do they connect control logic to actuators, and how do they process sensor input?"

```text
SENSE                                      THINK                                ACT
physical    transducer   conditioning   ADC /      driver /   filter /     planner /   controller   command   motor     power      current   torque    motion
quantity →  (sensor)  →  (amp, filter) → digital → firmware → estimator → behavior →  (PID/MPC/ → over bus → driver →  stage   →  in coil →  (motor) → (gear,
(angle,                                  (bus)                (state)      (goal)      RL policy)  (CAN, …)   (FOC)     (MOSFETs)                       joint)
 light…)        ▲                                                                                                                                         │
                └────────────────────────────────────────── the world changes, the sensors see it ─────────────────────────────────────────────────────────┘
```

Sections:

1. **Sensing side:** a physical quantity → a voltage or a pulse train → bits → a timestamped, calibrated, filtered measurement → an estimate of the robot's state.
2. **Acting side:** a goal → a trajectory → a controller's output (a torque, a velocity or a joint position target) → a message on a bus → the motor driver → PWM on MOSFETs → current in the coils → torque → through the gearbox → joint motion.
3. **The loop rates, nested:** why one robot runs many loops at once, and where each one lives.

   | Loop | Typical rate | Runs on |
   |---|---|---|
   | Motor current (torque) loop / FOC | ~10–40 kHz | Motor driver MCU |
   | Joint velocity / position (PD) | ~1–10 kHz | Driver or joint MCU |
   | Balance / whole-body control | ~0.2–1 kHz | Main computer, real-time |
   | Learned policy (RL) | ~30–100 Hz | Main computer / GPU |
   | Perception, mapping | ~5–30 Hz | Main computer / GPU |
   | Planning | ~1–10 Hz | Main computer |
   | Mission / task | seconds–hours (on Mars, a daily plan) | Computer / ground station |

   (Rates are typical ranges, to be checked against cited examples when written.)
4. **Case walk-throughs** of the same chain in four robots:
   - a line follower (one MCU, everything in one loop);
   - a robot arm (position-controlled servo drives on EtherCAT);
   - a quadruped running an RL policy (a policy outputs joint targets at ~50 Hz → PD in each joint driver at kHz → FOC current loop);
   - a Mars rover (a ground plan → onboard autonomy → motor controllers, with no human in the fast loops).
5. **Where it breaks:** latency, noise, saturation, bus overload, timestamps out of sync, ground loops.

Demos: an animated chain where the learner can click any stage to see its signal (voltage, bits, message, PWM, current, torque); a "slow the loops" slider showing what happens when an inner loop runs too slowly; an RL-policy-to-motor walkthrough.

## 4. Compare pages (side by side)

Each Compare page is a table plus a short "how to choose" decision guide and links to the nodes. Columns are fixed per page so options can be compared directly. Numbers are given as qualitative ratings or typical ranges, cited where specific.

| ID | Page | Rows (options) | Columns (examples) |
|---|---|---|---|
| X1 | **Actuators** | Brushed DC, gearmotor, hobby servo, smart bus servo, stepper, BLDC + gearbox, quasi-direct-drive, harmonic-drive joint, SEA, linear actuator, hydraulic, pneumatic, artificial muscles | How it works · torque density · speed · precision · backdrivability · needs external feedback? · driver needed · control complexity · cost · noise · typical robots |
| X2 | **Transmissions** | Spur, planetary, harmonic, cycloidal, belt, ball screw, lead screw, cable/tendon, direct drive | Ratio range · backlash · efficiency · backdrivability · shock tolerance · size · cost · used in |
| X3 | **Locomotion** | Differential, Ackermann, omni/mecanum, tracks, rocker-bogie, legs (2/4/6), multirotor, fixed-wing, thrusters | Terrain · speed · efficiency · stability · complexity · typical robots |
| X4 | **Power** | Alkaline, NiMH, Li-ion, LiPo, LiFePO4, tether, solar + battery, fuel cell, engine/hydraulic power unit, RTG | Energy density · power density · voltage · lifetime/cycles · safety · cost · charging · where used · plus a rail-voltage guide (5/12/24/48 V) |
| X5 | **Sensors** | All of C9–C10 | Measures · range · rate · accuracy · drift · works outdoors/dark? · interface · cost · typical use |
| X6 | **Compute** | 8-bit MCU, 32-bit MCU, MCU with wireless, FPGA, SBC, embedded GPU module, industrial PC, PLC, rad-hard processor | Real-time? · compute power · power draw · OS · I/O · typical job in the robot · examples of boards (named generically, cited) |
| X7 | **Buses and links** | UART, I²C, SPI, CAN/CAN-FD, RS-485, EtherCAT, Ethernet, USB, Wi-Fi, BT, LoRa, RC radio, cellular, satellite/deep-space | Speed · distance · wires · devices on one bus · determinism · noise immunity · typical use |
| X8 | **Motor drivers** | H-bridge ICs, brushed driver boards, stepper drivers, hobby ESCs, FOC drivers, smart actuator controllers, industrial servo drives | Motor types · control modes · feedback supported · interface · current range |
| X9 | **Control methods** | Bang-bang, PID, cascade PID, feedforward, LQR, MPC, impedance, whole-body QP control, RL policy | Needs a model? · handles constraints? · compute · tuning effort · robustness · where used |
| X10 | **Estimators** | Moving average, complementary, KF, EKF, UKF, particle filter, factor graph | Nonlinear? · multimodal? · compute · typical use |
| X11 | **Planners** | BFS, Dijkstra, A*, D* Lite, PRM, RRT, RRT*, trajectory optimization, MPC | Space type · optimal? · speed · dimensions · typical use |
| X12 | **Software and OS** | Bare metal, Arduino-style framework, RTOS, Linux, real-time Linux, ROS 2, micro-ROS, PLC runtime | Real-time · complexity · ecosystem · where in the robot |
| X13 | **Simulators** | Gazebo, MuJoCo, Isaac Sim/Lab, Webots, PyBullet, CoppeliaSim, Drake | Physics quality · speed · GPU parallel · rendering · ROS integration · best for (checked per release) |
| X14 | **Learning approaches** | Model-free RL, model-based RL, behavior cloning, diffusion policy, VLA models | Data needed · sim needed? · generalization · compute · maturity |
| X15 | **Programming languages** | C, C++, Python, Rust, MATLAB/Simulink, ladder logic | Where used · speed · learning curve · ecosystem |

## 5. Robots: teardowns of robot types

Each robot type gets a teardown page in the same template, so they can be compared directly (and there is a matrix view of all of them side by side).

**Teardown template**
1. Job and environment (what it must survive and do).
2. Body: DOF, mechanisms, materials, mass.
3. Actuators and transmissions, and *why* these were chosen.
4. Power: source, voltage, runtime.
5. Sensors.
6. Compute: what runs where.
7. Communication: internal buses, external links.
8. Software stack and loop rates (its own Signal Chain diagram).
9. Control and key algorithms.
10. The hard problems for this type.
11. Real examples (cited, dated).
12. How to start building a small one → its Roadmap and Builds.

**Robot types**

| ID | Type | What makes it distinctive |
|---|---|---|
| R1 | Industrial arm (6-axis) | Precision and repeatability, harmonic/cycloidal gearing, servo drives, safety cages |
| R2 | Collaborative arm (cobot) | Torque sensing, force limits, working beside people |
| R3 | Wheeled mobile robot / warehouse AMR | Navigation stack, fleets, lidar, docking |
| R4 | Self-driving car | Sensor suites (camera, radar, lidar), perception at speed, safety cases |
| R5 | **Planetary rover (Mars)** | Rocker-bogie, radiation-hardened compute, solar or RTG power, communication delay, onboard autonomy, extreme temperatures |
| R6 | **Quadruped** | Dynamic legged locomotion, QDD actuators, RL and MPC controllers, terrain |
| R7 | **Humanoid** | Many DOF, balance, whole-body control, hands, hydraulic vs electric generations, power and heat |
| R8 | Multirotor drone | Thrust-to-weight, ESCs and BLDC, flight controller loops, IMU-centric estimation |
| R9 | Underwater robot (ROV/AUV) | Pressure, buoyancy, thrusters, acoustic communication, no GPS |
| R10 | Surgical robot | Teleoperation, precision, cable drives, remote center of motion |
| R11 | Exoskeleton and prosthetics | Human-in-the-loop control, EMG sensing, safety |
| R12 | Soft robot | Compliant materials, pneumatic actuation, modelling challenges |
| R13 | Swarm robots | Many simple robots, local rules, emergent behavior |
| R14 | Home and service robots | Cost limits, cluttered spaces, interaction |

## 6. Roadmaps and Builds

### Roadmaps

A roadmap is a goal-specific path through the Tech Tree: it highlights the nodes you need (must / helpful / later) and the order. Each ends in a Build.

| Roadmap | Key nodes beyond Foundations |
|---|---|
| "My first robot" | C3, C4, C7, C9–C11, L1, L3, L5, M5 |
| Mobile robot / rover | + M1, M2, P1–P3, P8–P9, I1, I3, I5, S2 |
| Mars-rover-style | + C3 (rocker-bogie), C7 (solar/RTG), S5, S6, I4 (autonomy under delay) |
| Robot arm | + C2, C5, M3, M10, I2, I8 |
| Drone | + C4 (BLDC), L3 (ESC), M11, P4, I7 |
| Quadruped | + C5 (QDD), L4, M4, M7, M9, I6, I9, I11, S3 |
| Humanoid | Quadruped roadmap + M8, M9, I8, I10, I12, S7 |
| Robotics software / AI | S1–S3, P5–P6, I9–I12 |

### Builds: the ladder

Real builds from easy to hard. Each Build page (titled "Build 05: Self-balancing robot"): goal, nodes used, block diagram, component categories (with a link to the Compare page for picking), wiring and power plan, firmware/software outline, the Signal Chain for this build, test checklist, common failures, safety notes, and "make it harder" extensions. Specific parts and prices are suggested as examples only and checked when written.

| # | Build | Learns |
|---|---|---|
| B01 | Blink → button → servo sweep | Microcontroller basics, PWM |
| B02 | Line follower | Sensors → control loop → motors in one MCU |
| B03 | Obstacle-avoiding differential-drive robot | Motor drivers, distance sensing, state machines |
| B04 | Wheel speed PID with encoders | Closed loop, tuning, odometry |
| B05 | Self-balancing two-wheel robot | IMU fusion, fast control loop, inverted pendulum |
| B06 | 3–4 DOF servo arm | Kinematics, IK, trajectories |
| B07 | ROS 2 rover with lidar/camera | Software architecture, SLAM, navigation |
| B08 | Rocker-bogie rover | Mechanism design, terrain, outdoor autonomy |
| B09 | Quadcopter from a flight controller | BLDC, ESCs, flight control loops, safety |
| B10 | Small servo quadruped | Gaits, leg kinematics |
| B11 | BLDC quasi-direct-drive leg / quadruped | FOC, torque control, MPC/RL in simulation → real |
| B12 | Humanoid upper body or small biped | Whole-body thinking, balance, many-joint integration |

## 7. Templates

**Node page (doc)**
1. One-line summary and prerequisites.
2. What it is and why robots need it.
3. How it works (plain language first; equations in go-deeper boxes).
4. Variants side by side (link to the Compare page).
5. **How it connects:** inputs from and outputs to neighboring nodes; its place in the Signal Chain.
6. Where it shows up in real robots (links to teardowns).
7. Try it: an interactive demo.
8. Build it: a bench exercise or a link to a Build (optional).
9. Common mistakes.
10. Go deeper: books, papers, courses.
11. Sources.
12. Next nodes.

**Compare page:** table → how to choose → each option in one paragraph → links.

**Teardown page:** the template in §5.

## 8. Interactive demos (examples, not final)

Demos stay central, as in Sand to Tetris, but serve understanding rather than one build:

- Foundations: sense–think–act loop toy, vector/frame playground, Ohm's law circuit, PWM → average voltage.
- Components: motor torque–speed lab, gearbox calculator, battery runtime estimator, sensor noise lab, bus timing visualizer.
- Low level: H-bridge switch game, FOC/commutation animation, debounce/aliasing scopes, loop-jitter timeline.
- Motion: PID playground, diff-drive arcs, arm FK/IK drag, gimbal lock vs quaternions, inverted pendulum, MPC preview horizon.
- Perception: Kalman filter train, particle filter in a symmetric house, HSV tuner, lidar scan builder, occupancy grid.
- Intelligence: A* vs Dijkstra race, RRT growing, Q-learning gridworld, gait pattern explorer, reward-hacking example.
- Systems: Signal Chain explorer, loop-rate slider, Mars communication-delay teleop challenge.
- Robots: an exploded-view anatomy diagram per teardown.

## 9. Facts and sources

Same rule as Sand to Tetris: every date, number and claim about a real robot or product is checked against web sources and cited. Product details (actuator specs, compute boards, simulator features) change fast, so pages show when they were checked. Contested history is marked as contested (e.g. who coined "robot": Karel Čapek credited his brother Josef; Devol's 1954 patent vs Unimate's 1961 installation; how "programmable" al-Jazari's automata were). We describe real robots by type and cite public sources; no guesses presented as specs.

## 10. Rough size

| | Count |
|---|---|
| Foundation nodes | 10 |
| Tech-tree nodes (tiers 1–6) | ~65 |
| Compare pages | 15 |
| Robot teardowns | 14 |
| Roadmaps | 8 |
| Builds | 12 |
| Demos | ~60 |

## 11. Suggested release order

1. **Skeleton:** Start here, F0, the Tech Tree view (all nodes as stubs), the Signal Chain page.
2. **Foundations:** F1–F9.
3. **Hardware:** Tier 1 + Compare X1–X8 (motors, power, sensors, compute, buses, drivers).
4. **Low level + control:** Tier 2, Tier 3 core (M1–M5, M10), X9.
5. **Three flagship teardowns + roadmaps:** Mars rover, quadruped, humanoid.
6. Then perception, intelligence, systems, remaining teardowns and Builds.

## 12. Open decisions

1. **Depth per node:** a short overview (~1 page) everywhere first, or full depth chapter by chapter?
2. **Hands-on code:** should some nodes include in-browser coding exercises (PID, Kalman, A*, IK), or keep the site to reading + demos + real Builds?
3. **Languages:** English and Mongolian throughout, with Japanese staged, like Sand to Tetris?
4. **Flagship robots:** start with Mars rover, quadruped and humanoid, or different ones?
5. **Real product names:** name specific commercial parts and robots (cited, dated), or keep pages generic with examples in a separate "examples" box?
