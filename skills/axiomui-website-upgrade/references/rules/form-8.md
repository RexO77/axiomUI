# Validate when a correction is useful

- ID: form-8
- Category: Forms & inputs
- Tags: Validation, Timing, Error handling
- URL: https://axiomui.nischal.fyi/rules/form-8

Let people finish an entry before showing a format error. Submission is a dependable checkpoint. Use a field-exit check when early correction helps, and clear an existing error as soon as the value is accepted.

- Do: Error appears after leaving field
- Don't: Error appears during incomplete entry

## Why it works

An incomplete email such as “maya@” is expected halfway through typing. Treating that intermediate state as a failure produces a message the user cannot resolve except by continuing the entry they already intended to make.

- [GOV.UK · Form validation](https://design-system.service.gov.uk/patterns/validation/)

## What breaks

A form that validates only on blur can miss submission from the final field. A message that keeps returning on every key can interrupt someone who is already correcting the problem.

## How to apply it

1. Validate on submission, including on the server.
2. Reserve field-exit validation for complete-looking entries where the feedback is worth the interruption.
3. Keep errors associated with the input and avoid repeating live announcements for each keystroke.

## Review questions

1. Can someone start an address without an error flash?
2. Does submitting from the final field still catch a problem?
3. Does the error clear when the entered address is accepted?
