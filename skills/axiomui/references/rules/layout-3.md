# Show which items belong together

- ID: layout-3
- Category: Layout & spacing
- Tags: Grouping, Spacing, Forms
- URL: https://axiomui.nischal.fyi/rules/layout-3

Use a smaller gap within a label–field pair and a larger gap between fields. Keep each label programmatically associated with its control.

- Do: Label (gap-2) Input (gap-6) Next Label
- Don't: Label (gap-4) Input (gap-4) Next Label

## Why it works

The form has two different distances to communicate. An 8px label gap and a 24px field gap make the next pair visible. The accessible name and grouping still come from the markup, including a fieldset and legend for related choices.

- [W3C WAI · Grouping form controls](https://www.w3.org/WAI/tutorials/forms/grouping/)
- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)

## What breaks

When the same 16px separates every row, a label between two fields can appear to describe either one. Adding an error or wrapping the label can make the ambiguity worse.

## How to apply it

1. Give labels and their fields a shared group container.
2. Keep hints and errors within the group for the affected field.
3. A gap implies a group. Keep gaps equal between equivalent siblings, then check that a multiline label still reads with its own field.

## Review questions

1. Which control does each visible label describe?
2. Does the accessible name match the visible label?
3. When an error appears, is the next group still distinct?
