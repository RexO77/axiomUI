# Show which items belong together

- ID: layout-3
- Category: Layout & spacing
- Tags: Grouping, Spacing, Forms
- URL: https://axiomui.nischal.fyi/rules/layout-3

Keep each label closer to its input than to the next field. Connect the label to its input in the markup as well.

- Do: 8px from label to input · 24px between fields
- Don’t: 16px from label to input · 16px between fields

## Why it works

Each label sits 8px above its input, with 24px between fields. That spacing shows which input the label describes. Connect each label to its input in the markup. Use a fieldset and legend to name a group of related choices.

- [Scottish Government · Form spacing](https://designsystem.gov.scot/guidance/forms/form-spacing)
- [W3C WAI · Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)
- [W3C WAI · Grouping form controls](https://www.w3.org/WAI/tutorials/forms/grouping/)
- [NN/g · Proximity principle in visual design](https://www.nngroup.com/articles/gestalt-proximity/)
- [IBM Carbon · Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)

## What breaks

When the same 16px separates every row, a label between two fields can appear to describe either one. Adding an error or wrapping the label can make the ambiguity worse.

## How to apply it

1. Give labels and their fields a shared group container.
2. Keep hints and errors within the group for the affected field.
3. Use the same gap between field groups. Check that a label still looks paired with its input when it wraps.

## Before you ship

1. Which control does each visible label describe?
2. Does the accessible name match the visible label?
3. When an error appears, is the next group still distinct?
