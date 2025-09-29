# Part 2:

animator.js
1. Purpose: Drives logical time using requestAnimationFrame
2. play, pause, step, reset methods
 - Standard playback controls
3. setSpeed(v)
 - Allows adjustable speed multipliers

timeline.js
1. Purpose: Stores ordered events and emits them at the right tick
2. next(now)
 - Returns only new events for the current tick
3. seek(tick)
 - Rewinds/forwards to replay from any time

main.js
1. Imports Animator + Timeline
 - Splits responsibilities: Animator drives time, Timeline manages events
2. Helper $ and els cache
 - $ makes DOM queries short; els stores all UI references in one place
3. Enable controls
 - Initially disabled to prevent errors; JS re-enables once ready
4. announce(msg)
 - Creates hidden text for screen readers
5. state object
 - Stores current data, SVG reference, bar elements, and metrics
6. initSVG()
 - Builds an SVG bar chart of the array. Labels included
7. updateBar()
 - Updates bar height + label after a swap/set
8. Mocked bubble sort events (mockEventsFromArray)
 - Generates compare, swap, clear events
9. draw(events)
 - Handles each event type, updates bars + metrics, highlights compares/swaps
10. buildNewDemo() + randomizeData()
 - Reset counters, rebuild timeline, randomize arrays
11. DOM Ready boot
 - Instantiates Animator, draws starter bars, builds timeline
12. Control listeners (Play/Step/Reset/Speed/Randomize)
 - Connect UI to Animator + Timeline. Updates labels and announces changes.