# Make the start of an entrance visible

- ID: motion-5
- Category: Motion & interaction
- Tags: Easing, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-5

When movement is the first sign that a menu opened, choose a curve that makes early progress visible. An accelerating exit can suit a panel leaving the screen.

- Do: Menu open: ease-out
- Don't: Menu open: ease-in

## Why it works

Easing changes displacement over time. A slow-starting curve can move a short distance so gradually that its first frames appear still. An immediate change to the trigger or panel can acknowledge the action even if a subsequent element accelerates.

- [CSS Easing · Cubic Bézier curves](https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions)
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)

## What breaks

When the release of a busy button and the start of a menu both change imperceptibly, the user has little visible evidence of which state the interface has reached.

## How to apply it

1. Check the first few frames at the actual travel distance.
2. Acknowledge the action at its source if the destination needs time to appear.
3. Evaluate entrance and exit curves separately.

## Review questions

1. What is the first visible response to the press?
2. Does the trigger still provide feedback with animation disabled?
3. Does the exit communicate where the panel is going?
