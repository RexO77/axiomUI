# Minimum body size

- ID: typo-11
- Category: Typography & text
- Tags: Readability, Mobile
- URL: https://axiomui.nischal.fyi/rules/typo-11

Body text should never be smaller than 14px on mobile or 12px on desktop, and subtext should stop at 12px. Below that the x-height drops under what most people can scan without leaning in.

- Do: Body: 16px / Subtext: 12px
- Don't: Body: 11px / Subtext: 9px

## Why it works

What fails below 12px is stroke weight, not overall size. A typical UI sans draws its stems at roughly 8-9% of the em, so a 10px regular stem falls under one CSS pixel and antialiases to gray instead of rendering as a solid stroke, while the x-height drops to about five pixels, too few rows to keep a, e, and s distinct from each other. Mobile keeps the higher floor of the two, 14px against 12px, because phones get read while moving and in unpredictable light, where that thinned rendering has no margin left.

## What breaks

Body text set at 11px on mobile forces users to zoom in or hold the phone closer to read comfortably, and subtext dropping to 9px becomes illegible for anyone with even mild vision strain.

## How to apply it

1. Set body text to 16px by default and treat 14px mobile / 12px desktop as floors, not targets.
2. Never let subtext fall below 12px, on any breakpoint or in any density mode.
3. Give text inputs at least 16px on mobile: iOS Safari zooms the viewport for anything smaller.
4. Check dense data screens first, where shrinking type is the easiest shortcut.

## Review questions

1. Is body text at least 14px on mobile and 12px on desktop?
2. Does subtext stay at or above 12px everywhere?
3. Can the smallest text on screen be read without zooming?
