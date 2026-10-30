# Animate transform and opacity

- ID: motion-14
- Category: Motion & interaction
- Tags: Transform, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-14

Transform and opacity avoid layout work and stay smooth under load. Avoid animating size, position, padding, or margins.

- Do: translateY + opacity
- Don't: height + top

## Why it works

Transform and opacity run on the compositor thread and skip layout and paint entirely, so translateY plus opacity stays smooth even under heavy main-thread load. Animating height or top forces layout recalculation on every frame, competing with whatever else the page is doing.

## What breaks

Animating height and top on a growing panel causes visible jank and dropped frames whenever the main thread is busy with data fetching or rendering, making the motion look choppy under real-world load.

## How to apply it

1. Animate translateY plus opacity for movement and appearance.
2. Replace any animated height, top, left, width, padding, or margin with a transform equivalent.
3. Use a fixed or measured wrapper size if content height needs to appear to change.
4. Profile with the browser’s performance panel to confirm no layout thrashing during the animation.

## Review questions

1. Does the animation stay smooth even while other work is happening on the page?
2. Is movement driven by transform and opacity rather than top, left, or size properties?
3. Does any panel visibly stutter as it grows or shrinks in height?
