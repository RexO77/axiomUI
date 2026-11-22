# Mark optional fields

- ID: form-3
- Category: Forms & inputs
- Tags: Labels, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-3

When most fields are required, say so before the first field. Label the others “optional” and accept them blank.

- Do: Phone labeled optional
- Don’t: Optional phone number marked required

## Why it works

Labeling Phone as optional tells people they can skip it. If you use an asterisk, explain it before the first field and make sure screen readers announce which fields are required.

- [GOV.UK · Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [W3C WAI · Indicating required form fields](https://www.w3.org/WAI/WCAG22/Techniques/html/H90)
- [HTML · The required attribute](https://html.spec.whatwg.org/multipage/input.html#the-required-attribute)
- [Baymard · Required and optional form fields](https://baymard.com/research-articles/required-optional-form-fields)

## What breaks

Someone may share a phone number just because it looks required. If a required field looks optional, they may discover the mistake only after submitting.

## How to apply it

1. Ask only for information the task needs.
2. State the marking convention before the first field and label exceptions consistently.
3. Set the required attribute on required fields and check that the server rejects them when empty.

## Before you ship

1. Can someone tell which questions may be skipped?
2. Do announced and visual requirements agree?
3. Will the service accept a blank optional answer?
