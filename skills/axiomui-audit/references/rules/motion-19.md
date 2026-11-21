# Use drag resistance where overshoot is meaningful

- ID: motion-19
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-19

When a custom dragged surface reaches a meaningful limit, use bounded resistance to signal the edge. Never re-implement native scroll bounce. Clamp controls that represent a fixed valid range.

- Do: Card yields less as the pull increases
- Don't: Card stops abruptly at the limit

## Why it works

When a custom draggable card reaches a meaningful limit, moving it less for each additional pixel of pull can make the boundary tangible. A thumb beyond a slider’s maximum can imply a value the control cannot store, so keep numerical sliders in their valid range.

- [Motion · Elastic drag constraints](https://motion.dev/docs/react-drag#elastic-constraints)
- [CSS Overscroll Behavior · Scroll boundary default actions](https://www.w3.org/TR/css-overscroll-1/#scroll-chaining)

## What breaks

Unbounded overdrag can resemble valid progress. A spring that settles far from the value the application commits makes the control feel inaccurate.

## How to apply it

1. Define the visual limit from a meaningful boundary such as a drawer’s last snap point.
2. Cap visual travel beyond the edge and preserve the valid underlying value.
3. Give a clear release destination and a reduced-motion settle.

## Review questions

1. What does movement beyond the edge mean here?
2. Can someone mistake overshoot for a valid value?
3. Does releasing or canceling show the correct resting state?
