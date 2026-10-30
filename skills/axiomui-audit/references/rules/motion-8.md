# Press feedback

- ID: motion-8
- Category: Motion & interaction
- Tags: Buttons, Feedback
- URL: https://axiomui.nischal.fyi/rules/motion-8

Pressable controls should respond immediately with a tiny transform so users know the interface heard them.

- Do: button:active scale(0.96)
- Don't: button:active scale(0.90)

## Why it works

A pressable control needs a visible response within the same frame as the tap. button:active scale(0.96) gives enough compression to register as touched without looking crushed; too aggressive a scale, or none at all, leaves users unsure the tap landed.

## What breaks

A button with no active state or an overly aggressive scale(0.9) makes every tap feel uncertain, so users tap twice to confirm the interface responded, doubling accidental submissions.

## How to apply it

1. Apply scale(0.96) on :active for all pressable controls.
2. Never scale below roughly 0.93 or omit an active state entirely.
3. Trigger the press effect on pointerdown, not on click, so feedback is instant.
4. Pair the scale with a subtle shadow or brightness shift for reinforcement on larger buttons.

## Review questions

1. Does every button visibly compress when pressed?
2. Does the press effect feel subtle rather than jarring or exaggerated?
3. Does feedback appear the instant you press down, not after release?
