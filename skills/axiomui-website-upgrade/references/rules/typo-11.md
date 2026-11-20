# Choose a readable body size

- ID: typo-11
- Category: Typography & text
- Tags: Readability, Mobile
- URL: https://axiomui.nischal.fyi/rules/typo-11

Start routine reading around 16px and adjust for the typeface, task, and distance. Give essential details enough space to enlarge without losing content.

- Do: Body: 16px / Subtext: 12px
- Don't: Body: 11px / Subtext: 9px

## Why it works

The alert asks the reader to recognize a sign-in and inspect its supporting detail. The large x-height of one face can make it read differently from another at the same CSS size. The 16px/12px pair in the preview illustrates a hierarchy and needs a reading check in context.

- [USWDS · Typesetting and optical size](https://designsystem.digital.gov/design-tokens/typesetting/overview/)
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

## What breaks

Shrinking an alert to 11px with 9px detail buys space by making the information harder to inspect. Enlarging it may expose a second problem if the row has a fixed height.

## How to apply it

1. Start with a tested body token and relative units.
2. Try the smallest supporting text using the actual content on a representative device.
3. Check enlargement to 200% and allow the row to grow.

## Review questions

1. Can the reader make the decision using the smallest essential line?
2. At 200% enlargement, are all details and actions available?
3. Could moving or wrapping a detail recover space?
