# Match field width to plausible answers

- ID: form-4
- Category: Forms & inputs
- Tags: Forms, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-4

Use width as a cue when an answer has a predictable shape. Leave enough room for every supported format, including postal codes from the regions the form serves.

- Do: Short ZIP field / wider street address field
- Don't: Five-digit ZIP in a street-width field

## Why it works

Street addresses vary substantially in length. A compact ZIP field in a US-specific example suggests a short answer, while a wider street field leaves room to read an address during review. Width and allowed length are separate decisions.

- [GOV.UK · Address forms](https://design-system.service.gov.uk/patterns/addresses/)

## What breaks

A five-character maximum copied from a compact example can reject ZIP+4 or international postal codes. A plausible-looking field width alone does not explain those restrictions.

## How to apply it

1. Choose the width from representative answers, including longer valid ones.
2. Set length restrictions only when the data contract requires them.
3. Accept common formatting variations and preserve leading zeroes in postal codes.

## Review questions

1. Which regions and formats does this form support?
2. Is a valid longer answer still readable?
3. Does the backend accept the same formats as the field?
