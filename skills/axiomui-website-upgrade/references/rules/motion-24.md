# Stagger without blocking

- ID: motion-24
- Category: Motion & interaction
- Tags: Stagger, Timing
- URL: https://axiomui.nischal.fyi/rules/motion-24

Stagger grouped entrances only when it improves rhythm, and keep delays short so interaction is never blocked.

- Do: 30-80ms between items
- Don't: 220ms between items

## Why it works

Staggered entrances help users chunk a group of items as one related unit arriving together, a known cognitive benefit of sequential reveal. But that benefit only holds if delays stay in the 30-80ms range per item; push much beyond that and the stagger becomes a cascade the user has to sit through before anything is usable. Short per-item delays keep the rhythm perceptible without blocking interaction.

## What breaks

A list of ten items staggers in at 200ms per item, the user tries to click the fifth item while it is still animating, and the interface reads as sluggish and unresponsive for over a second.

## How to apply it

1. Set stagger delay between 30ms and 80ms per item, never open-ended cascades.
2. Cap total stagger duration so the last item is interactive well under a second.
3. Only stagger grouped entrances where the rhythm actually reads as related, not every list.
4. Allow pointer and keyboard interaction on already-revealed items before the stagger finishes.

## Review questions

1. Is the delay between staggered items within roughly 30-80ms rather than a long cascade?
2. Can the user interact with earlier items while later ones are still animating in?
3. Does the stagger actually improve the sense of a related group, not just delay the UI?
