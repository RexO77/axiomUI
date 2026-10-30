# Subtle exit motion

- ID: motion-27
- Category: Motion & interaction
- Tags: Exit, Timing
- URL: https://axiomui.nischal.fyi/rules/motion-27

Exits should preserve context without stealing attention. Use shorter timing and a small fixed translate instead of dramatic movement.

- Do: opacity 0 + translateY(-12px) at 150ms
- Don't: translateY(-100%) scale(0.5) at 400ms

## Why it works

An exit only has to signal that something is leaving. Nothing new needs comprehending, so it should be quieter and shorter than the entrance it mirrors: 150ms with a small fixed translateY(-12px) and a fade to opacity 0 removes the element without disturbing the context around it. A dramatic translateY(-100%) with scale(0.5) behaves like a second entrance played backwards, claiming attention the departure does not need.

## What breaks

A toast exits by scaling down to zero and flying off the full width of the screen, drawing the eye away from the next thing the user should focus on, and the surrounding content feels like it jumped.

## How to apply it

1. Exit with opacity 0 and a small translateY(-12px) over about 150ms.
2. Never use large-magnitude exits like translateY(-100%) or scale(0.5).
3. Keep exit duration shorter than the matching enter animation.
4. Confirm the exit doesn’t shift or reflow unrelated surrounding layout.

## Review questions

1. Does the exit use a small translate and fade rather than a dramatic scale or slide?
2. Is the exit noticeably quicker than the element’s entrance animation?
3. Does surrounding content stay stable in place while the element exits?
