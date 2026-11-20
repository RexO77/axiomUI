# Use a playback controller for programmatic animation

- ID: motion-22
- Category: Motion & interaction
- Tags: Animation API, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-22

Use element.animate() when code needs to start, pause or reverse a known sequence. Let the browser interpolate between keyframes.

- Do: element.animate() on transform
- Don't: setInterval transform every 80ms

## Why it works

A timer scheduled every 80ms can send only about twelve or thirteen position updates a second, even when the display can present more. The Web Animations API accepts the start and end transforms together and returns a controller. It can keep playback aligned with the animation timeline without per-frame script writes.

- [W3C · Web Animations timing and playback](https://www.w3.org/TR/web-animations-1/)
- [web.dev · Animation performance and profiling](https://web.dev/articles/animations-guide)

## What breaks

When a component unmounts or a later action supersedes the first, an old completion callback can restore the wrong end state. Choosing an animation API alone does not resolve ownership.

## How to apply it

1. Store the Animation handle while the operation is active.
2. Handle cancellation separately from successful completion.
3. Profile the chosen properties and use per-frame scripting only when the state really depends on live input.

## Review questions

1. Can playback reverse or pause without creating another competing animation?
2. What state remains after cancellation?
3. Is a coarse timer visibly stepping through an otherwise continuous movement?
