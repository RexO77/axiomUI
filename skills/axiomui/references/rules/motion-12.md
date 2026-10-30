# Use transitions for interruptible UI

- ID: motion-12
- Category: Motion & interaction
- Tags: Animation API, CSS
- URL: https://axiomui.nischal.fyi/rules/motion-12

CSS transitions can retarget mid-flight. Keyframes restart from the beginning and feel worse under rapid interaction.

- Do: transition: transform 420ms
- Don't: animation: turn 420ms

## Why it works

A transition negotiates with the element’s current position. Interrupt a 420ms transform transition at 38% of its travel and the new target is computed from where the element actually is, so it eases home from there. A keyframe animation has no notion of a current position to negotiate with: re-triggering replays a declared timeline, so the same interruption teleports the element to the value the old run was aiming at and starts the trip over from the far end.

## What breaks

A keyframe-driven toggle interrupted halfway jumps to a declared keyframe value instead of easing from where it stands, so the control snaps to the far end of its travel before it starts back, and a user clicking quickly sees it move the wrong way first.

## How to apply it

1. Drive any interruptible toggle or state flip with a transition, as in transition: transform 420ms, never an @keyframes run.
2. Replace keyframe animations on rapidly-triggerable controls with transition-based ones.
3. Reserve @keyframes for animations that always run to completion uninterrupted, like a one-time success checkmark.
4. Test by rapidly re-triggering the control to confirm it retargets instead of snapping.

## Review questions

1. Does rapidly re-toggling the control reverse smoothly instead of snapping back?
2. Is a CSS transition, not a keyframe animation, driving this interruptible state?
3. Does the animation ever visibly jump to a start position under fast clicking?
