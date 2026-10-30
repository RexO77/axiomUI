# Never use ease-in for UI

- ID: motion-5
- Category: Motion & interaction
- Tags: Easing, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-5

Ease-in starts slow at the exact moment the user expects feedback. UI entrances and responses should move immediately.

- Do: Menu open: ease-out
- Don't: Menu open: ease-in

## Why it works

Ease-in holds near-zero velocity at frame one, the exact instant a user expects visual confirmation their click landed. UI entrances and responses need ease-out so movement starts fast and settles, confirming the action registered immediately.

## What breaks

A menu opened with ease-in appears to hang for its first frames before accelerating, so users click again assuming the first press missed, causing duplicate triggers.

## How to apply it

1. Swap ease-in for ease-out on every UI entrance.
2. Audit existing dropdown, menu, and toast transitions for lingering ease-in curves.
3. Treat any curve starting at zero velocity as a bug, not a style choice.
4. Ease-in is defensible only on an exit, where nothing has to be comprehended as it leaves; it is never right for anything appearing or responding.

## Review questions

1. Does the menu begin moving immediately when opened, with no slow start?
2. Do any UI responses appear to hesitate before they begin animating?
3. Is ease-in absent from all entrance and response animations?
