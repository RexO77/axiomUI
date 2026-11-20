# Keep decorative motion independent of busy scripts

- ID: motion-21
- Category: Motion & interaction
- Tags: Animation API, CSS, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-21

For fixed movement between two states, try a CSS transform transition. Once a browser can composite it, a busy main thread can delay script callbacks while the visual transition continues.

- Do: Tab indicator: CSS transition
- Don't: Tab indicator: rAF + style writes

## Why it works

The example moves both indicators across the same distance. One gets a destination once. The other receives a transform write in each animation-frame callback. During a long JavaScript task those callbacks cannot run. The second indicator advances to the current position when the thread becomes available.

- [web.dev · Animation performance and profiling](https://web.dev/articles/animations-guide)
- [W3C · Web Animations timing and playback](https://www.w3.org/TR/web-animations-1/)
- [web.dev · Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

## What breaks

A smoothly moving indicator can mask an unresponsive application. Keyboard input and event handlers can still wait behind the same long task.

## How to apply it

1. Use a transition when the start and destination are known.
2. Record the animation and check whether the browser actually composites it.
3. Break up or remove long main-thread tasks so input can be handled promptly.

## Review questions

1. Which updates require JavaScript on every frame?
2. Does the indicator actually keep moving on the target device?
3. Can the user activate the destination during the work?
