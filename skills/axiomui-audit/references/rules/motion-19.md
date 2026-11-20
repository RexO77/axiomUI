# Use drag resistance where overshoot is meaningful

- ID: motion-19
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-19

An elastic edge can show that a surface has reached its limit while the finger continues moving. Clamp controls that represent a fixed valid range.

- Do: Increasing friction past edge
- Don't: Invisible wall stop

## Why it works

When pulling past the end of a scrollable surface, decreasing movement per pixel of pull can make the boundary tangible. A slider that represents a numerical value has a different job. A thumb beyond its maximum may imply a value the control cannot store.

- [Flutter · Bouncing scroll physics](https://api.flutter.dev/flutter/widgets/BouncingScrollPhysics-class.html)
- [Flutter · Clamping scroll physics](https://api.flutter.dev/flutter/widgets/ClampingScrollPhysics-class.html)

## What breaks

Unbounded overdrag can resemble valid progress. A spring that settles far from the value the application commits makes the control feel inaccurate.

## How to apply it

1. Choose which bounds belong to the model and which permit a visual overshoot.
2. Cap visual travel beyond the edge and preserve the valid underlying value.
3. Give a clear release destination and a reduced-motion settle.

## Review questions

1. What does movement beyond the edge mean here?
2. Can someone mistake overshoot for a valid value?
3. Does releasing or canceling show the correct resting state?
