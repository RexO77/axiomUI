# Damp drag boundaries

- ID: motion-19
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-19

When users drag past a natural boundary, apply damping or friction instead of a hard stop so the interaction feels physical.

- Do: Increasing friction past edge
- Don't: Invisible wall stop

## Why it works

A hard stop at a drag boundary reads as hitting an invisible wall, breaking the illusion of a physical object. Applying increasing friction or damping past the edge, the same rubber-banding logic behind iOS scroll overscroll, tells the user where the boundary is while still following their finger. The resistance itself becomes the feedback, no separate indicator needed.

## What breaks

A user drags a panel past its edge, the content freezes dead against their finger movement, and the drag feels like it hit a physical wall rather than a UI limit.

## How to apply it

1. Apply increasing friction past the edge instead of clamping position outright.
2. Scale resistance with overdrag distance so it gets harder to pull the further past the boundary.
3. Never let the dragged element’s position stop updating outright at the limit.
4. Spring the element back to the boundary on release using the same damped curve.

## Review questions

1. Does dragging past the edge still move slightly, with rising resistance, instead of stopping dead?
2. Does releasing past the boundary spring the element back smoothly?
3. Does the resistance feel proportional to how far past the edge the drag goes?
