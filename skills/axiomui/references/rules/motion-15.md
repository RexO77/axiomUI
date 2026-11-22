# Base slide exits on the element’s height

- ID: motion-15
- Category: Motion & interaction
- Tags: Transform, Drawers, Responsive
- URL: https://axiomui.nischal.fyi/rules/motion-15

To slide a toast off screen, move it by its own height plus the gap to the clipping edge. A percentage in translateY() scales with the toast’s height.

- Do: translateY(150%)
- Don’t: translateY(40px)

## Why it works

translateY(100%) moves a toast by its own height. If it starts 10px above the bottom edge, its top 10px can still be visible. Add the gap to the exit distance or clip the toast at its starting bottom edge.

- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)
- [CSS Overflow · Clip overflow](https://www.w3.org/TR/css-overflow-3/#valdef-overflow-clip)
- [Radix Primitives · Toast swipe animation](https://www.radix-ui.com/primitives/docs/components/toast#animating-swipe-gesture)
- [HTML · Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees)

## What breaks

A fixed exit distance can hide a short message but leave a longer, localized or wrapped message on screen. Even after the toast disappears, its controls can still receive focus.

## How to apply it

1. Identify the edge or clipping boundary the object must cross.
2. Test short, wrapped and localized messages with the actual inset.
3. Remove the dismissed surface from interaction when its state changes.

## Before you ship

1. Does the tallest toast clear the boundary?
2. Does the shortest toast also clear its inset?
3. Can focus reach the dismissed content?
