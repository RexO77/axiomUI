# Use will-change sparingly

- ID: sys-14
- Category: System & logic
- Tags: Motion, Performance, CSS
- URL: https://axiomui.nischal.fyi/rules/sys-14

Use will-change only when profiling shows that advance preparation helps a particular element. Name the expected property and release the hint when the need passes.

- Do: will-change: transform, opacity on one measured card
- Don't: will-change: transform, opacity on every card

## Why it works

A browser may use a hint to prepare for a change before the interaction starts. What it reserves depends on its implementation. A hint is neither a request for a guaranteed GPU layer nor evidence that a slowdown has been fixed.

- [CSS Will Change · The will-change property](https://www.w3.org/TR/css-will-change-1/#will-change)

## What breaks

Putting a valid transform hint on every card can reserve resources for dozens of items that stay still. Some hints can also create a stacking context before the animation begins and change how overlays paint.

## How to apply it

1. Compare a representative interaction with and without the hint.
2. Apply it to the measured element with enough lead time for the browser to prepare.
3. Remove temporary hints when the interaction settles and recheck stacking and resource use.

## Review questions

1. Which trace identifies the problem?
2. Does this hint improve that interaction on the target device?
3. How many elements retain the hint when idle?
