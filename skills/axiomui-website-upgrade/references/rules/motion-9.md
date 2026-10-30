# Never scale from zero

- ID: motion-9
- Category: Motion & interaction
- Tags: Entry, Transform
- URL: https://axiomui.nischal.fyi/rules/motion-9

Elements should not appear from scale(0). Start near full size with opacity so the object feels physically present. Small icons (24px or less) are the exception: they can start as low as scale(0.25).

- Do: scale(0.95) + opacity 0
- Don't: scale(0) + opacity 0

## Why it works

Objects in the physical world do not grow from nothing. Starting a surface at scale(0.95) with opacity 0 keeps it feeling already present and merely becoming visible; scale(0) reads as conjuring it out of a single point, and on a panel-sized element that much travel pulls the eye away from the content the panel exists to show.

## What breaks

An element animating in from scale(0) appears to burst into existence from a single pixel, drawing exaggerated attention instead of feeling like a natural appearance.

## How to apply it

1. Start surface entrances at scale(0.95) combined with opacity 0.
2. Never set an initial or keyframe scale value of 0.
3. Keep the starting scale between roughly 0.9 and 0.97 for panels, popovers, and modals; small icons can travel further, since their pixel change is tiny.
4. Pair scale with opacity so the object fades in as it settles rather than popping.

## Review questions

1. Does the panel appear at nearly full size as it fades in?
2. Is there any element that visibly grows from a single point or zero size?
3. Does the entrance feel like a subtle settle rather than a dramatic pop?
