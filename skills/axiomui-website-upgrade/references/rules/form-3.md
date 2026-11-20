# Make required and optional choices clear

- ID: form-3
- Category: Forms & inputs
- Tags: Labels, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-3

When most questions are required, state that convention and mark the optional exceptions in words. Keep the visible instructions and the form’s actual validation in agreement.

- Do: Full name · Email · Phone (Optional)
- Don't: Full name * · Email * · Phone *

## Why it works

“Phone (optional)” answers a practical question before someone looks up their number. An asterisk can also communicate a requirement when its meaning is explained before the form and exposed to assistive technology.

- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [GOV.UK · Question pages](https://design-system.service.gov.uk/patterns/question-pages/)

## What breaks

Marking Phone as required while the service accepts an empty value invites unnecessary disclosure. Leaving a truly required field unmarked under an unclear convention produces avoidable errors at submission.

## How to apply it

1. Ask only for information the task needs.
2. State the marking convention before the first field and label exceptions consistently.
3. Set native required semantics on required controls and verify the server enforces the same contract.

## Review questions

1. Can someone tell which questions may be skipped?
2. Do announced and visual requirements agree?
3. Will the service accept a blank optional answer?
