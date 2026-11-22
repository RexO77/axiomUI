# Keep decorative motion independent of busy scripts

- ID: motion-21
- Category: Motion & interaction
- Tags: Animation API, CSS, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-21

For a move between two fixed positions, use a CSS transform transition. If the browser runs it on the compositor, it can keep moving while a long JavaScript task blocks frame callbacks.

- Do: CSS transform transition
- Don’t: JavaScript updates the transform every frame

## Why it works

Both cards travel the same distance. The CSS transition gets its destination once. JavaScript moves the other card in requestAnimationFrame callbacks. A long task blocks those callbacks, so that card pauses and then jumps ahead.

- [web.dev · Why are some animations slow?](https://web.dev/articles/animations-overview)
- [W3C · Web Animations timing and playback](https://www.w3.org/TR/web-animations-1/)
- [web.dev · Animation smoothness](https://web.dev/articles/smoothness)
- [web.dev · Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)
- [web.dev · High-performance CSS animations](https://web.dev/articles/animations-guide)

## What breaks

A smoothly moving indicator can mask an unresponsive application. Keyboard input and event handlers can still wait behind the same long task.

## How to apply it

1. Use a transition when the endpoints are known. For scripted playback, keep the Animation object returned by element.animate() so you can pause, reverse or cancel it. Handle cancellation separately from completion.
2. Record the animation and check whether the browser actually composites it.
3. Break up or remove long main-thread tasks so input can be handled promptly.

## Before you ship

1. Which updates require JavaScript on every frame?
2. Does the indicator actually keep moving on the target device?
3. How long does a click or keypress wait during a long task?
