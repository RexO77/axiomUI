# Group by proximity

- ID: layout-3
- Category: Layout & spacing
- Tags: Grouping, Spacing, Forms
- URL: https://axiomui.nischal.fyi/rules/layout-3

Items that belong together should sit closer than items that don't. Proximity groups faster than a border can, and it costs no ink.

- Do: Label (gap-2) Input (gap-6) Next Label
- Don't: Label (gap-4) Input (gap-4) Next Label

## Why it works

This is Gestalt’s law of proximity: the eye reads spatial closeness as relatedness before it reads borders or lines. A tight gap-2 between a label and its input signals these belong together; a wider gap-6 before the next label signals a new group starts here.

## What breaks

Set every gap to gap-4 uniformly and a label ends up equidistant from its own input and the next label, so users can’t tell which label belongs to which field and start mis-tabbing between them.

## How to apply it

1. Use gap-2 (8px) between a label and its input, and gap-6 (24px) before the next label.
2. Never apply one flat gap value, like gap-4 everywhere, across both relationships.
3. Make the gap between groups clearly larger than the gap inside a group.
4. Rely on space, not divider lines, as the primary grouping signal.

## Review questions

1. Is the gap between a label and its input visibly smaller than the gap before the next label?
2. Could a user tell which label belongs to which field with all borders removed?
3. Are related items grouped by whitespace rather than by a line separator?
