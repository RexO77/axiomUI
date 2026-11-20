# Use a shared spacing scale

- ID: layout-1
- Category: Layout & spacing
- Tags: Spacing, Consistency
- URL: https://axiomui.nischal.fyi/rules/layout-1

Choose named spacing steps for repeated relationships. A 4px base is useful for padding and gaps. Hairlines, optical offsets, and content-driven dimensions can use other values.

- Do: 4px, 8px, 16px, 24px, 32px, 48px
- Don't: 13px, 5px

## Why it works

The settings cards compare 16px padding and 8px gaps with 13px and 5px. A shared scale gives the next person building a settings row a known starting point. The reason to reuse 8px is the relationship between items, even when an equally tidy number would fit the grid.

- [USWDS · Spacing units](https://designsystem.digital.gov/design-tokens/spacing-units/)

## What breaks

Repeatedly inventing nearly identical gaps makes changes expensive. Conversely, rounding a 1px border or a text container’s intrinsic height onto the spacing grid can visibly damage it.

## How to apply it

1. Choose tokens for common spaces within a group and between groups.
2. Reuse one token wherever the same relationship recurs.
3. Keep optical adjustments local and explain what required them.

## Review questions

1. Do comparable components use the same spacing step?
2. Does each larger gap represent a different relationship?
3. Would rounding this exception improve the result?
