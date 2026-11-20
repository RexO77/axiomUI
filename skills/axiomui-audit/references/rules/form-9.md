# Show format constraints before entry

- ID: form-9
- Category: Forms & inputs
- Tags: Validation, Guidance, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-9

When a format really matters, show a persistent hint and a valid example. Accept equivalent input when it can be interpreted reliably.

- Do: MM / YY hint
- Don't: No format hint

## Why it works

A card can print its expiry as “03/27.” A nearby MM / YY hint lets the user match the two parts to the field. If the service can normalize spaces and separators, making the user reproduce them adds no information.

- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [GOV.UK · Date inputs](https://design-system.service.gov.uk/components/date-input/)

## What breaks

A form that first reveals its expiry format in an error message has charged an extra submission attempt for an instruction it could have given earlier.

## How to apply it

1. Show the hint before entry and keep it available during editing.
2. Associate the hint with the field and localize it for the supported formats.
3. Test paste, autofill and common variations before adding a restrictive input mask.

## Review questions

1. Can someone enter a valid answer on their first attempt?
2. Which variations can be normalized safely?
3. Does the error show an example that this particular field accepts?
