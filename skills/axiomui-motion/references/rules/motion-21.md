# Use CSS under load

- ID: motion-21
- Category: Motion & interaction
- Tags: Animation API, CSS, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-21

Predetermined UI animations should use CSS when possible because they keep running while JavaScript is busy.

- Do: Tab indicator: CSS transition
- Don't: Tab indicator: rAF + style writes

## Why it works

A CSS transition on transform or opacity is handed to the compositor, which ticks independently of the JavaScript main thread, so a tab-switch animation keeps its timing even while a script is busy parsing data or handling a heavy event. A setInterval-driven animation for the same predetermined motion competes for that same thread, so its frame timing degrades exactly when the app is under load. Predetermined, fixed-endpoint motion belongs in CSS specifically because its timing has no dependency on runtime state.

## What breaks

A heavy JavaScript task runs while a JS-driven animation is playing, the interval callbacks get delayed or dropped, and the tab motion visibly stutters or jumps to its end state.

## How to apply it

1. Use a CSS transition for the tab motion instead of a setInterval-based JS animation.
2. Reserve JavaScript-driven timing for motion that needs runtime values, not fixed endpoints.
3. Confirm the CSS transition keeps its frame rate while simulating a busy main thread.
4. Animate only transform and opacity in the CSS rule to stay off layout-triggering properties.

## Review questions

1. Does the tab motion stay smooth when the main thread is artificially busy?
2. Is the animation defined as a CSS transition rather than a JS interval or rAF loop?
3. Does the motion have a fixed, predetermined timing rather than depending on live data?
