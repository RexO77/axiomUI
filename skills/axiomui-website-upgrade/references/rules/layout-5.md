# Size button padding around the label

- ID: layout-5
- Category: Layout & spacing
- Tags: Buttons, Spacing
- URL: https://axiomui.nischal.fyi/rules/layout-5

Give a short text button more padding at the sides than above and below. Check its hit area and leave room for longer labels and larger text.

- Do: 16px at the sides · 8px above and below (2:1)
- Don’t: 8px on all sides (1:1)

## Why it works

Both buttons have 8px above and below “Get started”. Increasing the side padding from 8px to 16px gives the label room without making the button taller. Icon-only, toolbar and full-width buttons need their own sizing.

- [Bootstrap · Buttons](https://getbootstrap.com/docs/5.3/components/buttons/#variables)
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [IBM Carbon · Button guidelines](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines)
- [Material Design · Buttons](https://m1.material.io/components/buttons.html)
- [USWDS · Buttons](https://designsystem.digital.gov/components/button/)
- [USWDS · Button styles](https://raw.githubusercontent.com/uswds/uswds/v3.14.0/packages/usa-button/src/styles/_usa-button.scss)

## What breaks

A long translated label can overflow even with the same padding ratio. A compact button can meet that ratio and still be too small to tap.

## How to apply it

1. Use a button-size token that accounts for the line height.
2. Test the shortest and longest supported labels, including an optional icon.
3. Measure the clickable area. If it falls below 24 × 24 CSS pixels, check the spacing test or another exception in WCAG 2.5.8.

## Before you ship

1. Does the label have enough space beside it?
2. Can the button wrap or grow when text enlarges?
3. How large is the clickable area?
