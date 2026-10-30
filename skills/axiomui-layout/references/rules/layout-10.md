# Vertical rhythm

- ID: layout-10
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-10

Every section gap should be a whole multiple of one base unit, so the smallest gap becomes a unit the eye can count in. Values off that base read as accidental.

- Do: 8 → 16 → 32px (1x, 2x, 4x of 8)
- Don't: 8 → 13 → 18px (off the 8px base)

## Why it works

Section gaps read as a system when every step is a whole multiple of the base: 24, 48, and 72 are 1x, 2x, and 3x of a 24px base, so the smallest gap on the page is a unit the eye can measure every other gap against. A sequence like 24, 40, 56 climbs by a flat 16px instead, which the 24px base does not divide, so the ratio between one step and the next drops from 1.7x to 1.4x — the steps are irregular even though the increment is constant, and by the third one the gap is no longer distinguishable as a bigger break than the second.

## What breaks

Space sections at 24, then 40, then 56px and no gap marks a rank any more: the 16px difference between one step and the next is smaller than the 24px gap already separating closely related content inside a section.

## How to apply it

1. Build the section scale from whole multiples of one base unit: 24, 48, 72px against a 24px base.
2. Avoid a flat increment like 24, 40, 56px: 16px steps against a 24px base leave every step after the first off the scale.
3. Reserve the largest step for major section breaks and the smallest for closely related content.
4. Document the scale once in spacing tokens so every page reuses the same three or four steps.

## Review questions

1. Is every section gap a whole multiple of the smallest gap on the page?
2. Can you tell which section breaks are major versus minor from the gap size alone?
3. Do any two adjacent section gaps differ by an amount that is not a step in the scale?
