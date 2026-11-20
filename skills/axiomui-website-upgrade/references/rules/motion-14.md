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
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)

## What breaks

Substituting a transform for a height change can leave a gap or make two controls overlap. A large layout animation can miss frames during input.

## How to apply it

1. Decide whether neighboring content should move.
2. Use transform for independent travel and real layout when reflow is part of the result.
3. Record layout, paint and dropped frames on a representative device.

## Review questions

1. Are surrounding elements in the right places throughout?
2. Can the keyboard still reach each visible control?
3. What does the performance trace show while other work runs?
