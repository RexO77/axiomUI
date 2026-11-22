# Use larger gaps between sections

- ID: layout-10
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-10

Use a small gap within an item, a larger gap between items, and the largest gap between sections. Repeat that pattern for similar groups.

- Do: 8px / 16px / 32px section break
- Don’t: 8px / 16px / 16px section break

## Why it works

Both panes keep the first two gaps at 8px and 16px. A 32px section break makes the next heading read as a new group. When the break repeats the 16px gap, the heading looks like the next item in the same group.

- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)
- [Adobe Spectrum · Layout spacing](https://spectrum.adobe.com/foundations/layout-and-structure/spacing/layout-spacing)
- [NN/g · Proximity principle in visual design](https://www.nngroup.com/articles/gestalt-proximity/)
- [Every Layout · The Stack](https://every-layout.dev/layouts/stack/)

## What breaks

A section break close in size to an ordinary row gap can make two groups run together. Even on a 4px grid, a section break needs more space than a row gap.

## How to apply it

1. Give the smallest gap to closely related details.
2. Pick a visibly larger step for new groups and sections.
3. Inspect the rhythm after headings wrap and content grows.

## Before you ship

1. Where does one item end and the next section begin?
2. Do repeated sections have consistent spacing?
3. Does each section start with a larger gap than the items inside it?
