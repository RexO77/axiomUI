# Choose easing for the movement

- ID: motion-4
- Category: Motion & interaction
- Tags: Easing, Polish
- URL: https://axiomui.nischal.fyi/rules/motion-4

For an entrance, compare how much ground each curve covers before the content needs to be read. Use a stronger ease-out when the panel should reach its resting position early.

- Do: cubic-bezier(0.23, 1, 0.32, 1)
- Don't: ease — cubic-bezier(0.25, 0.1, 0.25, 1)

## Why it works

At the same duration, changing the curve redistributes the travel. One third of the way through this 360ms example, CSS ease covers about 58% of the distance and the stronger curve covers about 88%. Both finish at the same time. The choice changes how long the content stays far from its destination.

- [CSS Easing · Cubic Bézier curves](https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions)
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)

## What breaks

A curve tuned for an 8px menu entrance can produce a jarring first movement on a wide panel. A keyword curve may already suit a short move.

## How to apply it

1. Keep distance and duration fixed for the comparison.
2. Check the early movement at the largest supported distance.
3. Reuse a token for components with the same motion and purpose.

## Review questions

1. How far has the panel moved when the user starts reading?
2. Does the largest instance appear to jump?
3. Does a simpler curve communicate the same transition?
