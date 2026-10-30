# Use WAAPI for programmatic motion

- ID: motion-22
- Category: Motion & interaction
- Tags: Animation API, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-22

When animation needs JavaScript control, the Web Animations API gives runtime control while preserving CSS-level performance.

- Do: element.animate transform/opacity
- Don't: setInterval layout animation

## Why it works

The difference is who authors the frames. element.animate() hands the browser one declaration — keyframes, duration, easing — and the compositor interpolates every frame from it, at whatever rate the display actually refreshes, without JavaScript running again. setInterval asks the main thread to author each position by hand, on a period that has no relationship to the frame budget, so positions land twice or not at all and smooth travel collapses into a visible staircase. JavaScript still gets its runtime control either way: it decides when to play, reverse, or retarget, then hands the interpolation back.

## What breaks

A programmatic animation is built with setInterval adjusting a layout property like top or width, causing forced synchronous layout recalculation every frame and visible jank under any load.

## How to apply it

1. Drive programmatic motion with element.animate() targeting transform and opacity.
2. Never reach for setInterval to animate a layout-affecting property.
3. Use the returned Animation object’s play, pause, and reverse methods for runtime control.
4. Chain or update keyframes only after the values needed are actually known.

## Review questions

1. Does the programmatic animation stay smooth when triggered by dynamic runtime data?
2. Is the animation built with the Web Animations API rather than setInterval or setTimeout loops?
3. Are only transform and opacity being animated, not width, top, or other layout properties?
