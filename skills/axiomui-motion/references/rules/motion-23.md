# Scope rapidly changing drag styles

- ID: motion-23
- Category: Motion & interaction
- Tags: Gestures, Performance
- URL: https://axiomui.nischal.fyi/rules/motion-23

Update a drag value near the element that consumes it. If a changing custom property is inherited from a large ancestor, measure how much style work reaches its descendants.

- Do: element.style.transform
- Don't: Parent --swipe-amount variable

## Why it works

Unregistered custom properties normally inherit. A variable genuinely shared by many items can be useful. When only one card needs a per-frame offset, setting it on the list can enlarge the scope of invalidation. The browser, subtree and actual consumers determine the cost.

- [CSS Custom Properties · Inheritance and substitution](https://www.w3.org/TR/css-variables-1/)
- [CSS Properties and Values API · Registered properties](https://www.w3.org/TR/css-properties-values-api-1/)

## What breaks

A tiny benchmark can exaggerate the effect in either direction. Forced computed-style reads include synchronization overhead, and rounded timing values can make ratios unstable.

## How to apply it

1. Identify which elements actually consume the drag offset.
2. Compare a local transform, a local variable, or a registered non-inheriting property when appropriate.
3. Profile the real subtree on representative hardware and measure input as well as style work.

## Review questions

1. Which descendants need to change with the card?
2. Does the trace show style work outside those consumers?
3. Does the difference remain on representative content and hardware?
