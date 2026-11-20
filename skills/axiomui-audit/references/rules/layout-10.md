# Use spacing to express vertical hierarchy

- ID: layout-10
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-10

Give lines within one item, neighboring items, and major sections different spacing roles. Reuse the same role whenever that relationship recurs.

- Do: 8 → 16 → 32px (1x, 2x, 4x of 8)
- Don't: 8 → 13 → 18px (off the 8px base)

## Why it works

The example uses 8px, 16px, and 32px to distinguish three levels. The important property is the separation between those levels. A well-chosen scale can include intermediate steps or different increments and still explain the same hierarchy.

- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)

## What breaks

A section break close in size to an ordinary row gap can make two groups run together. Multiples of a single unit can still produce that problem if the wrong token is assigned.

## How to apply it

1. Give the smallest gap to closely related details.
2. Pick a visibly larger step for new groups and sections.
3. Inspect the rhythm after headings wrap and content grows.

## Review questions

1. Where does one item end and the next section begin?
2. Do repeated sections have consistent spacing?
3. Does a larger break correspond to a meaningful boundary?
