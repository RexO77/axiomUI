# Adapt outer spacing to available width

- ID: layout-9
- Category: Layout & spacing
- Tags: Spacing, Responsive, Mobile
- URL: https://axiomui.nischal.fyi/rules/layout-9

Reconsider large page and card insets when a layout narrows. Preserve the spacing that holds small controls and related text together. Change a token when the content shows why.

- Do: p-3 sm / p-6 lg
- Don't: p-6 sm / p-6 lg

## Why it works

A card with 24px padding on both sides spends 48px of its width before the first word is set. In a narrow slot, using 12px on each side gives the copy another 24px. The same change can be unnecessary inside a compact form field.

- [GOV.UK · Spacing](https://design-system.service.gov.uk/styles/spacing/)

## What breaks

Holding on to a wide gutter can push an action onto a second line. Scaling every gap down indiscriminately can crowd touch targets or erase a group boundary.

## How to apply it

1. Compare the content area at the narrowest and widest widths.
2. Use responsive tokens for large insets and static ones for stable internal relationships.
3. Check the card inside a narrow desktop column as well as on a phone.

## Review questions

1. Which gutter costs useful reading space?
2. Do interactive targets retain enough size and separation?
3. Does the layout work when a card narrows independently of the viewport?
