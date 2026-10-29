# Asymmetric enter and exit

- ID: motion-7
- Category: Motion & interaction
- Tags: Timing, Exit, Entry
- URL: https://axiomui.nischal.fyi/rules/motion-7

Entrances can be slightly slower for comprehension, but exits should be faster so the interface feels responsive.

- Do: Enter 220ms, exit 160ms
- Don't: Enter 360ms, exit 360ms

## Why it works

The two directions are paying for different things. An entrance buys the eye time to locate and read something that was not there a moment ago, so its 220ms is spent on comprehension. An exit has nothing left to comprehend — the user decided before the animation began — and every frame of it sits on the critical path of whatever they do next, because the leaving element still holds its space, and often the focus, until it finishes. Cutting the exit to 160ms is not stylistic asymmetry; run both at 360ms and dismissing costs 200ms more than it needs to, every single time.

## What breaks

Using the same slow timing for both directions makes closing a panel feel as sluggish as opening it, so dismissing things quickly reads as an unresponsive interface.

## How to apply it

1. Set enter to 220ms and exit to 160ms as separate tokens.
2. Never reuse a single duration variable for both enter and exit states.
3. Bias any asymmetry toward faster exits, never slower ones.
4. Test rapid open-close cycles to confirm exits never lag behind input.

## Review questions

1. Does closing an element feel faster than opening it?
2. Are enter and exit using different, deliberately chosen durations?
3. Does dismissing a panel ever feel like it takes as long as opening it?
