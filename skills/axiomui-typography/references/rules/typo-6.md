# De-emphasize with color, not size

- ID: typo-6
- Category: Typography & text
- Tags: Hierarchy, Contrast
- URL: https://axiomui.nischal.fyi/rules/typo-6

To make secondary text recede, lighten its color rather than shrink it below 12px. Color lowers emphasis without lowering legibility; size lowers both.

- Do: text-neutral-500 (14px)
- Don't: text-neutral-900 (10px)

## Why it works

Perceived importance and legibility travel on two different channels. Lowering contrast drops an element’s visual weight without touching how resolvable its letterforms are: 14px neutral-500 on white measures about 4.7:1 and still clears the 4.5:1 AA floor, while the same line at 10px in neutral-900 keeps all 17.9:1 of its contrast and strains acuity anyway. Shrink the type instead and you spend legibility on hierarchy you could have had for free.

## What breaks

A caption dropped to 10px to read as less important lands under the legible floor, so the timestamp or helper line beneath a field gets pinch-zoomed instead of read, and on a phone it is usually skipped entirely.

## How to apply it

1. De-emphasize with text-neutral-500 at 14px rather than shrinking neutral-900 to 10px.
2. Never drop a size below 12px to signal hierarchy.
3. Re-measure contrast after lightening: neutral-500 on white sits near 4.7:1, while neutral-400 falls to roughly 2.5:1 and fails AA.
4. Reserve size reduction for genuine label and caption roles, not for emphasis level.

## Review questions

1. Is secondary text de-emphasized with a lighter color rather than a smaller size?
2. Does any text on the page fall below 12px?
3. Does the lightened secondary text still measure 4.5:1 or better against its background?
