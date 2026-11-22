# Show each error under its field

- ID: comp-6
- Category: Components & actions
- Tags: Error handling, Feedback
- URL: https://axiomui.nischal.fyi/rules/comp-6

At the field, say what went wrong and how to fix it. If submission reveals several errors, link to each field from a summary at the top.

- Do: Invalid email = inline, under the field
- Don’t: Invalid email = toast, far from the field

## Why it works

A summary can link to each field with an error. Under Email, “Add the domain after @” tells someone how to fix maya@.

- [GOV.UK · Error messages](https://design-system.service.gov.uk/components/error-message/)
- [GOV.UK · Error summaries](https://design-system.service.gov.uk/components/error-summary/)
- [WCAG 2.2 · Error suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)
- [WCAG 2.2 · Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [Baymard · Adaptive validation error messages](https://baymard.com/research-articles/adaptive-validation-error-messages)
- [GOV.UK · Service problem pages](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/)

## What breaks

When an error notice fades, the rejected value stays and its explanation disappears. A network outage shown as a field error sends people looking for a fix they can’t make.

## How to apply it

1. Preserve the value and put the specific correction by the field.
2. Associate the message with the control, for example with aria-describedby.
3. If the service fails, keep a message visible at the form level.

## Before you ship

1. Can someone find the field from the summary?
2. Does the message explain a correction the user can actually make?
3. Can someone returning to the field still read the error?
