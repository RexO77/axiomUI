# Use will-change sparingly

- ID: sys-14
- Category: System & logic
- Tags: Motion, Performance, CSS
- URL: https://axiomui.nischal.fyi/rules/sys-14

will-change is a targeted performance hint, not a default. Use it only for compositor-friendly properties when a real first-frame stutter appears.

- Do: will-change: transform, opacity
- Don't: will-change: all

## Why it works

will-change: transform, opacity is a hint that promotes an element to its own GPU compositor layer ahead of an expected animation, but will-change: all or broad use forces the browser to allocate compositor memory for elements that never need it. It should appear only right before a real, observed first-frame stutter, then get removed.

## What breaks

will-change: all on the card component means every card in the list gets its own compositor layer, so a few hundred rows spend GPU memory on elements that never animate. The ten-card test page scrolls perfectly; the real list drops frames.

## How to apply it

1. Apply will-change: transform, opacity only to elements about to animate, never will-change: all.
2. Add it just before the animation starts and remove it once the animation finishes.
3. Reserve it for confirmed first-frame stutter, not as a default optimization.
4. Limit compositor-promoted properties to transform and opacity, the compositor-friendly ones.

## Review questions

1. Is will-change scoped to transform and opacity rather than set to all?
2. Is will-change removed from elements once their animation completes?
3. Was will-change added only after an observed stutter, not applied by default?
