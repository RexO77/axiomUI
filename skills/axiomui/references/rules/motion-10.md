# Anchor a popover’s motion to its trigger

- ID: motion-10
- Category: Motion & interaction
- Tags: Overlays, Transform
- URL: https://axiomui.nischal.fyi/rules/motion-10

If an anchored popover scales, put the transform origin on the edge facing the trigger. Recompute it after a collision changes placement.

- Do: transform-origin: the trigger
- Don't: transform-origin: center

## Why it works

A menu may open below its button in the middle of a page and above it at the bottom. A hardcoded top edge looks plausible in the first case and makes the second menu grow away from its button. The resolved placement gives the animation a stable reference.

- [Radix · Popover placement and transform origin](https://www.radix-ui.com/primitives/docs/components/popover)
- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)

## What breaks

A flipped panel can slide visually toward its trigger while the placement arrow points the other way. The two cues disagree.

## How to apply it

1. Choose the origin after placement and collision handling.
2. Use the positioning library’s resolved origin if it provides one.
3. Check alignment for offset triggers and right-to-left layouts.

## Review questions

1. Does the origin stay on the correct edge when the menu flips?
2. Does it line up with an off-center trigger?
3. Would a simple fade work better for a dialog without an anchor?
