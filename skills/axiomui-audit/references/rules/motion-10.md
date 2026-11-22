# Anchor a popover’s motion to its trigger

- ID: motion-10
- Category: Motion & interaction
- Tags: Overlays, Transform
- URL: https://axiomui.nischal.fyi/rules/motion-10

When a popover scales in, set its transform origin at the edge nearest its button. If it flips to the other side to fit, move the origin with it.

- Do: transform-origin: top left
- Don’t: transform-origin: center

## Why it works

A menu below its button grows from its top edge. If it opens above the button, use its bottom edge. Keeping the origin at the top makes the menu grow toward the button from the wrong side.

- [Radix · Popover placement and transform origin](https://www.radix-ui.com/primitives/docs/components/popover)
- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion)
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)
- [Floating UI · Flip middleware](https://floating-ui.com/docs/flip)

## What breaks

If a menu opens above its button but grows from its top edge, it looks as though it came from farther up the page.

## How to apply it

1. Choose the origin after placement and collision handling.
2. Use the positioning library’s resolved origin if it provides one.
3. Check alignment for offset triggers and right-to-left layouts.

## Before you ship

1. Does the origin stay on the correct edge when the menu flips?
2. Does it line up with an off-center trigger?
3. Would a simple fade work better for a dialog without an anchor?
