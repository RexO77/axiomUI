# Animate contextual icons

- ID: motion-28
- Category: Motion & interaction
- Tags: Icons, States
- URL: https://axiomui.nischal.fyi/rules/motion-28

When icons appear, disappear, or swap state, animate opacity, scale, and blur rather than toggling visibility abruptly.

- Do: scale 0.25 → 1, opacity 0 → 1, blur 4px → 0
- Don't: display: none to display: block

## Why it works

An icon appearing, disappearing, or swapping state is a small but real signal, and a display: none to display: block toggle gives the eye nothing to track: the change is over before it registers. Animating scale 0.25 to 1 with opacity 0 to 1 and blur 4px to 0 gives it something legible instead. A 0.25 start would be far too much travel on a panel, but on a 20px icon it starts at 5px across and covers 15 pixels of growth in total, so the same ratio reads as a crisp snap rather than a zoom.

## What breaks

A status icon swaps instantly via display toggling when a task completes, and users scanning the screen miss the change entirely because there was no motion to catch their attention.

## How to apply it

1. Animate icon scale from 0.25 to 1 with opacity 0 to 1 and blur 4px to 0 on appear.
2. Never swap icon visibility with a plain display: none to display: block toggle.
3. Reverse the same scale, opacity, and blur values on disappear so the pair reads as one gesture.
4. Keep the blur to small elements: filter costs more than transform and opacity, and on a large surface that cost shows.
5. Hold the whole swap to about 300ms so it reads as one object changing state, not a delay before the next one.

## Review questions

1. Does the icon scale and fade in rather than snapping into view?
2. Is a blur-to-sharp transition visible as the icon appears?
3. Does the icon disappear with a matching animated transition instead of vanishing instantly?
