# Reduce outer padding when space is tight

- ID: layout-9
- Category: Layout & spacing
- Tags: Spacing, Responsive, Mobile
- URL: https://axiomui.nischal.fyi/rules/layout-9

Reduce outer padding when a narrow card leaves too little room for content. Keep the smaller gaps inside controls consistent.

- Do: 12px padding on the narrow card · 24px on the wide card
- Don’t: 24px padding on both cards

## Why it works

On the 72px card, 24px of padding on each side takes up 48px. Reducing it to 12px per side gives the content 24px more room. The wider card keeps its 24px padding.

- [GOV.UK · Spacing](https://design-system.service.gov.uk/styles/spacing/)
- [MDN · CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [USWDS · Layout grid](https://designsystem.digital.gov/utilities/layout-grid/)
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## What breaks

Holding on to a wide gutter can push an action onto a second line. Scaling every gap down indiscriminately can crowd touch targets or erase a group boundary.

## How to apply it

1. Compare the content area at the narrowest and widest widths.
2. Let outer padding shrink with the card. Keep the gap between a label and its control consistent.
3. Check the card inside a narrow desktop column as well as on a phone.

## Before you ship

1. Which gutter costs useful reading space?
2. Do interactive targets retain enough size and separation?
3. Does the layout work when a card narrows independently of the viewport?
