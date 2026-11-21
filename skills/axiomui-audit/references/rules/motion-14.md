# Choose animation properties with layout in mind

- ID: motion-14
- Category: Motion & interaction
- Tags: Transform, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-14

Use transform and opacity when content can move without rearranging its neighbors. If space must open in the layout, measure the cost of animating the real geometry.

- Do: translateY + opacity
- Don't: height

## Why it works

A translated element keeps its original place in normal flow. This is useful for an overlay, but translating accordion content cannot push the following paragraph down. Height changes can do that work, with a layout cost that depends on the affected subtree and device.

- [web.dev · Animation performance and profiling](https://web.dev/articles/animations-guide)
- [CSS Custom Properties · Inheritance and substitution](https://www.w3.org/TR/css-variables-1/)
- [CSS Will Change · The will-change property](https://www.w3.org/TR/css-will-change-1/#will-change)

## What breaks

Substituting a transform for a height change can leave a gap or make two controls overlap. A large layout animation can miss frames during input.

## How to apply it

1. Use transform for independent travel and real layout when reflow is part of the result. Record layout, paint and dropped frames on a representative device.
2. During a real drag, profile style invalidation as well as input latency. Check which descendants consume the changing value, and compare a write on the dragged element with an inherited custom property on the whole list.
3. Compare traces with and without will-change. If it helps, hint only the measured element and remove the hint when the interaction settles. Check whether a hint such as will-change: transform creates a stacking context before the animation and changes how overlays paint.

## Review questions

1. Are surrounding elements in the right places throughout?
2. Can the keyboard still reach each visible control?
3. What does the performance trace show while other work runs?
