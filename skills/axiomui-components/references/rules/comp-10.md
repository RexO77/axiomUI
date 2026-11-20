# Match icon scale within a toolbar

- ID: comp-10
- Category: Components & actions
- Tags: Icons, Consistency
- URL: https://axiomui.nischal.fyi/rules/comp-10

Use a shared icon size for controls with equal roles. Check their apparent weight at the actual toolbar size and size the hit areas independently.

- Do: All toolbar icons: 20px
- Don't: Mixed 16px, 20px, 24px icons in toolbar

## Why it works

A 20px artboard can hold a compact solid shape or an open outline. Matching the boxes establishes a baseline. Matching the apparent scale also requires looking at the drawings, stroke weights and internal whitespace.

- [IBM Carbon · Icon sizing and alignment](https://www.carbondesignsystem.com/building-blocks/foundations/icons/guidelines)

## What breaks

A 24px trash icon beside a 16px archive icon can give a secondary action more emphasis purely through size. Enlarging the glyph alone still leaves its clickable area uncertain.

## How to apply it

1. Choose one artboard size for a peer group.
2. Review thin, dense and asymmetric glyphs beside each other at their rendered size.
3. Adjust optical imbalance within the icon family while keeping focus and pointer targets consistent.

## Review questions

1. Which actions belong to the same group?
2. Does one glyph dominate without a reason?
3. Can the button remain easy to hit even when the drawing is small?
