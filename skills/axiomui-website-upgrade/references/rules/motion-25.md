# Review motion in slow time

- ID: motion-25
- Category: Motion & interaction
- Tags: Polish, Timing
- URL: https://axiomui.nischal.fyi/rules/motion-25

Slow animations down during review to catch abrupt easing, wrong origins, unsynced properties, and awkward color blends.

- Do: Inspect at 2x-5x duration
- Don't: Judge only at full speed

## Why it works

Motion flaws like a wrong transform-origin, unsynced property timing, or a muddy color blend are often invisible at full speed but obvious once slowed to 2x-5x duration, since human perception can’t parse sub-200ms discrepancies at normal playback. Reviewing in slow time exposes exactly which property lags, which easing curve snaps instead of glides, and where a blend passes through an ugly intermediate hue. This is a review technique, not a shipped behavior.

## What breaks

An entrance animation has its scale and opacity slightly out of sync, it looks fine at full speed in a quick check, and it ships with a barely-perceptible but bothersome mismatch that only shows up slowed down.

## How to apply it

1. Slow the animation to 2x-5x its normal duration using devtools or a temporary multiplier.
2. Check transform-origin, easing shape, and property sync at the slowed rate.
3. Watch color transitions specifically for muddy or unintended intermediate blends.
4. Never sign off on a new animation having only watched it at full speed.

## Review questions

1. Was this animation reviewed at 2x-5x its normal duration before shipping?
2. Do all animated properties stay synchronized when played back slowly?
3. Does any color transition pass through an unintended muddy blend when slowed down?
