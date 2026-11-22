# Size fields for the expected answer

- ID: form-4
- Category: Forms & inputs
- Tags: Forms, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-4

Size fields for the answers you expect. For postal codes, allow room for the longest format you accept.

- Do: Short ZIP field / wider street address field
- Don’t: Five-digit ZIP in a street-width field

## Why it works

A short ZIP field suggests a short answer. A wider street address field gives people room to reread what they typed. Choose the character limit separately from the width.

- [Baymard · Matching input widths to expected answers](https://baymard.com/research-articles/form-field-usability-matching-user-expectations)
- [GOV.UK · Address forms](https://design-system.service.gov.uk/patterns/addresses/)
- [GOV.UK · Text inputs](https://design-system.service.gov.uk/components/text-input/)
- [HTML · Number input state](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number))
- [USPS · Addressing standards](https://pe.usps.com/text/dmm300/602.htm)

## What breaks

A five-character limit rejects ZIP+4 and longer postal codes such as SW1A 1AA. Keep the field compact without cutting off valid answers.

## How to apply it

1. Choose the width from representative answers, including longer valid ones.
2. Set length restrictions only when the data contract requires them.
3. Accept common formatting variations and preserve leading zeros in postal codes.

## Before you ship

1. Which regions and formats does this form support?
2. Is a valid longer answer still readable?
3. Does the backend accept the same formats as the field?
