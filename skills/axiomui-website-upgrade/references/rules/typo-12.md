# Balance short headings

- ID: typo-12
- Category: Typography & text
- Tags: Wrapping, Headings
- URL: https://axiomui.nischal.fyi/rules/typo-12

Short headings should use balanced wrapping so line breaks feel intentional instead of leaving a single orphaned word.

- Do: h1, h2, h3 { text-wrap: balance }
- Don't: h1, h2, h3 { text-wrap: wrap }

## Why it works

Default browser wrapping breaks a heading purely on available width, which often strands a single word alone on the last line. text-wrap: balance redistributes words across all lines so each one is closer to equal length, producing breaks that look chosen rather than accidental, the same instinct a designer applies manually in Figma.

## What breaks

A two-line heading wraps to three words then one lonely orphaned word, and that ragged, unbalanced shape reads as unpolished even though the copy itself is fine.

## How to apply it

1. Apply text-wrap: balance to h1, h2, and h3 elements.
2. Rely on it instead of manually inserting line breaks for short headings.
3. Skip it on long, multi-sentence headings where the browser limit kicks in anyway.
4. Check every heading at multiple viewport widths, since balance recalculates per width.

## Review questions

1. Do short headings avoid leaving a single orphaned word on the last line?
2. Is text-wrap: balance applied to h1/h2/h3 elements?
3. Do heading line breaks look intentional rather than accidental?
