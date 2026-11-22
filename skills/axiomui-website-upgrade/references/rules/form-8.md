# Show format errors on submission

- ID: form-8
- Category: Forms & inputs
- Tags: Validation, Timing, Error handling
- URL: https://axiomui.nischal.fyi/rules/form-8

Let people type and move between fields. Show format errors on submission and clear each one when the field is valid.

- Do: Error appears after Continue
- Don’t: Error appears while typing

## Why it works

An incomplete email such as “maya@” is expected halfway through typing. Pressing Continue tells the form the person is ready for it to check the address.

- [GOV.UK · Form validation](https://design-system.service.gov.uk/patterns/validation/)
- [Baymard · Inline form validation](https://baymard.com/research-articles/inline-form-validation)
- [W3C WAI · Indicating error fields](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)
- [W3C WAI · Form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)

## What breaks

A premature error can interrupt someone who types slowly or moves between fields before finishing an answer.

## How to apply it

1. Validate on submission, including on the server.
2. Let people move between fields before submission without triggering new format errors.
3. Associate each error with its field and clear it when the correction is accepted. Announce the message once when it appears.

## Before you ship

1. Can someone type maya@ and Tab away before submitting without seeing an error?
2. Does pressing Continue with that same value show the format error?
3. Does the error clear when the entered address is accepted?
