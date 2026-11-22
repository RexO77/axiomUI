# Give corner targets more room

- ID: mobile-3
- Category: Mobile
- Tags: Touch targets, Hit areas
- URL: https://axiomui.nischal.fyi/rules/mobile-3

A small Close icon can have a generous touch target. Research found greater touch dispersion in corners. Start with the platform’s ordinary target, then test extra room where the cost of missing is high.

- Do: Tap 26 px from Close · 60 px target closes
- Don’t: Same tap · 48 px target misses

## Why it works

A corner gives a misplaced tap fewer places to land. Extra responding space can catch a tap that misses the same glyph in a smaller box.

- [Hoober, Design for Fingers, Touch, and People, Part 3](https://www.uxmatters.com/mt/archives/2017/07/design-for-fingers-touch-and-people-part-3.php)
- [Hoober, Design for Fingers and Thumbs Instead of Touch](https://www.uxmatters.com/mt/archives/2013/11/design-for-fingers-and-thumbs-instead-of-touch.php)
- [Bi, Li & Zhai, FFitts Law (CHI 2013)](https://research.google/pubs/ffitts-law-modeling-finger-touch-with-fitts-law/)
- [Android Accessibility Help, Touch targets](https://support.google.com/accessibility/android/answer/7101858?hl=en)
- [Apple, UI design tips](https://developer.apple.com/design/tips/)

## What breaks

The user touches beside Close and the overlay stays open.

## How to apply it

1. iOS — Keep the corner control inside the usable safe area. Apple recommends a 44 pt hit region for ordinary controls.
2. Android — Reserve at least 48 × 48 dp for ordinary independent controls. Account for implicit touch expansion when placing neighbors.
3. Web — Inspect the actual responding box. The fixture’s 60 CSS px is an example. WCAG 2.5.8 specifies a separate 24 CSS px test with exceptions.

## Before you ship

1. Replay the tap 26 CSS px to the right of Close. Which box contains that point?
2. Compare the seeded cloud with your own taps. Which result describes your hand?
3. Does extra padding encroach on a neighboring target?
