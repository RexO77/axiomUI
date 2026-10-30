# Consistent gutters

- ID: layout-8
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-8

Within one grid, use one gutter for siblings of the same kind. Vary the gap only to show grouping; otherwise mixed gaps feel accidental.

- Do: Cards: gap-2 throughout
- Don't: Rows gap-6, columns gap-2

## Why it works

A layout region reads as one system when a single gap value repeats in every direction; the eye calibrates to that rhythm and treats any deviation as a mistake, not a variation. Mixing gap-6 rows with gap-2 columns breaks that calibration because the grid no longer has one unit to measure by.

## What breaks

Set rows to gap-6 and columns to gap-2 in the same card grid and the layout reads as accidentally uneven, with cards sitting closer together side-to-side than top-to-bottom for no visible reason.

## How to apply it

1. Pick one gutter for siblings of the same kind and apply it in both directions: gap-2 for rows and columns alike.
2. Don’t mix values, such as gap-6 rows with gap-2 columns, within one grid of like items; a larger gap belongs only where it marks a new group.
3. Extend the same gutter value to nested grids in that region unless there’s a clear hierarchy reason not to.
4. Audit grid and flex gap properties for row-gap versus column-gap mismatches.

## Review questions

1. Is the same gap value used for both rows and columns in this grid?
2. Do any two adjacent grids in the same region use different gutter sizes?
3. Does the spacing rhythm feel like one system rather than several stitched together?
