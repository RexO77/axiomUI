# Consistent gutters

- ID: layout-8
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-8

Keep gutters consistent between equivalent siblings. A grid of independent cards can start with equal gaps on both axes. Use different row and column gaps when the two directions represent different relationships.

- Do: Cards: gap-2 throughout
- Don't: Rows gap-6, columns gap-2

## Why it works

The preview changes only the gap between rows in a two-by-two grid. At 8px across and 24px down, the cells begin to look like two horizontal pairs. That is a useful distinction when the pairs belong together.

- [CSS Box Alignment · Gaps between boxes](https://www.w3.org/TR/css-align-3/#gaps)
- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)

## What breaks

An unexplained row break can suggest a grouping that the content does not support. Enforcing square gutters everywhere can also crowd rows of captions or separate a label from its value.

## How to apply it

1. Identify the units a reader should compare or scan together.
2. Apply a consistent row gap and a consistent column gap.
3. Inspect actual captions and unequal card heights before linking both axes to one token.

## Review questions

1. Does the pattern imply rows, columns, or independent cards?
2. Is that grouping meaningful in the content?
3. What happens to the gutters when the grid loses a column?
