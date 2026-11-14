---
title: "Rocker-bogie rover"
summary: "A small six-wheeled rover with the same kind of suspension as the Mars rovers, driving itself around obstacles."
---

## Common failures {#failures}

- **A wheel lifts off the ground.** A pivot is too stiff, or the pivots are in the wrong places. Every pivot should turn freely; move them until the weight spreads evenly.
- **The microcontroller resets when the motors start.** Starting motors draw a burst of current that pulls the battery's voltage down. Feed the logic through its own [[~voltage-regulator|regulator]], add a capacitor across its supply, and join all the [[~ground|grounds]] at one point.
- **It stalls on a climb.** The motors don't have enough torque for the weight. Use motors with more gearing, or make the rover lighter. [[C2]] explains the trade.
- **It won't drive straight.** No two motors are exactly alike. Add wheel encoders and a speed loop for each side ([[L4]], [[M5]]).
- **Wires come loose as it bumps along.** Tie wires down near every connector, and leave slack where they cross a pivot.

## Safety {#safety}

- **Lithium batteries can catch fire.** A damaged or wrongly charged lithium battery can catch fire or explode. Use a charger made for your battery, follow its instructions, don't leave it charging unwatched, take it off the charger when it is full, and stop using a battery that bulges, hisses or gets hot.[@osha-lithium]
- **Fit a fuse and a switch you can reach.** If something shorts, the fuse should blow before the wires heat up.
- **Test with the wheels off the ground first,** and keep fingers away from the wheels and pivots while the motors can run.

## Make it harder {#harder}

- Add wheel encoders and hold each side at a set speed ([[L4]], [[M5]]).
- Steer the four corner wheels with servos, as the Mars rovers do, and turn without skidding ([[M2]]).
- Add an IMU and keep track of which way the rover faces ([[P1]], [[P4]]).
- Drive to a list of [[~waypoint|waypoints]] on its own ([[I1]], [[I3]]).
- Find obstacles in camera images instead of with distance sensors ([[P5]]).
