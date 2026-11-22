# Show the expected format before typing

- ID: form-9
- Category: Forms & inputs
- Tags: Validation, Guidance, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-9

Show the expected format before typing and keep it visible during editing. Accept other formats you can read without guessing.

- Do: MM / YY shown before typing
- Don’t: MM / YY shown only after an error

## Why it works

A card might show 03/27 as its expiry date. A nearby MM / YY hint lets the user match the two parts to the field. If the form can read the expiry with or without spaces, accept both.

- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [Baymard · Expiration date field formatting](https://baymard.com/research-articles/how-to-format-expiration-date-fields)
- [GOV.UK · Form validation](https://design-system.service.gov.uk/patterns/validation/)
- [GOV.UK · Date inputs](https://design-system.service.gov.uk/components/date-input/)
- [WCAG 2.2 · Labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)

## What breaks

Someone who enters “March 2027” has to change it to “03 / 27” and submit again. Showing MM / YY beside the field would save that attempt.

## How to apply it

1. Show the hint before entry and keep it available during editing.
2. Associate the hint with the field and localize it for the supported formats.
3. Test paste, autofill and common variations before adding a restrictive input mask.

## Before you ship

1. Can someone enter a valid answer on their first attempt?
2. Which variations can be normalized safely?
3. Does the error show an example that this particular field accepts?
