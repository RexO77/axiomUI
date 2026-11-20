# Place field errors beside the field

- ID: comp-6
- Category: Components & actions
- Tags: Error handling, Feedback
- URL: https://axiomui.nischal.fyi/rules/comp-6

Identify the field and explain how to fix it where the user can make the change. After submission, a linked error summary can also help people find several errors.

- Do: Invalid email = inline, under the field
- Don't: Invalid email = toast, far from the field

## Why it works

A notice at the top can say a form failed. The message beside Work email can tell someone that the domain is missing. These serve different purposes and can work together.

- [GOV.UK · Error messages](https://design-system.service.gov.uk/components/error-message/)
- [GOV.UK · Error summaries](https://design-system.service.gov.uk/components/error-summary/)

## What breaks

A disappearing notice leaves someone who needs more time with the same rejected value and no explanation. A network outage described as a field error sends them looking for a correction they cannot make.

## How to apply it

1. Preserve the value and put the specific correction by the field.
2. Associate the message with the control, for example with aria-describedby.
3. Keep a persistent service-level message when a system failure prevents progress.

## Review questions

1. Can someone find the field from the summary?
2. Does the message explain a correction the user can actually make?
3. Can someone returning to the field still read the error?
