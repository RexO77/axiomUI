# Ease out when a panel needs to settle early

- ID: motion-4
- Category: Motion & interaction
- Tags: Easing, Polish
- URL: https://axiomui.nischal.fyi/rules/motion-4

A strong ease-out covers most of the distance early. Use it when people need to read a panel as it opens.

- Do: cubic-bezier(0.23, 1, 0.32, 1)
- Don’t: ease — cubic-bezier(0.25, 0.1, 0.25, 1)

## Why it works

Both curves finish in 360ms. At 120ms, CSS ease has covered about 58% of the distance and the stronger ease-out about 88%. The stronger curve keeps the panel near its final position for longer.

- [CSS Easing · Cubic Bézier curves](https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions)
- [Emil Kowalski · Great Animations](https://emilkowal.ski/ui/great-animations)
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)
- [Microsoft Fluent · Motion](https://fluent2.microsoft.design/motion)

## What breaks

A curve tuned for an 8px menu entrance can produce a jarring first movement on a wide panel. A keyword curve may already suit a short move.

## How to apply it

1. Keep distance and duration fixed for the comparison.
2. Check the first few frames at the actual travel distance. An ease-in can make the start of a short entrance look still, even after the user has acted.
3. Reuse a token for components with the same motion and purpose.

## Before you ship

1. How far has the panel moved when the user starts reading?
2. Does the largest instance appear to jump?
3. Does a simpler curve communicate the same transition?
