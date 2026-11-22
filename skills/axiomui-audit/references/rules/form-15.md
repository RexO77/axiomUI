# Keep entered answers when validation fails

- ID: form-15
- Category: Forms & inputs
- Tags: Validation, Error handling
- URL: https://axiomui.nischal.fyi/rules/form-15

After a validation error, keep answers people can safely review, including the entry they need to correct. Mark the fields that need changes.

- Do: Error on Work email · all answers kept
- Don’t: Error on Work email · every field cleared

## Why it works

When Work email comes back with a format error, leaving maya@ in place lets the person see what was missing and finish the address. Preserving Full name and Company lets them submit again after that one correction.

- [GOV.UK · Validation pattern](https://design-system.service.gov.uk/patterns/validation/)
- [W3C WAI · Describing invalid form input](https://www.w3.org/WAI/WCAG22/Techniques/general/G85)
- [React · Preserving form values after an Action](https://react.dev/reference/react-dom/components/form#preserve-form-values-after-an-action)
- [React · Validation errors with useActionState](https://react.dev/reference/react/useActionState#displaying-validation-errors-and-preserving-form-values)
- [Baymard · Retaining entered data after validation errors](https://baymard.com/research-articles/preserve-card-details-on-error)

## What breaks

A reset erases the address the error refers to and makes the person re-enter answers that already passed validation.

## How to apply it

1. Check forms that pass a function to action or formAction, and submit handlers that call reset(). In React 19, an action that returns validation errors still completes normally and resets uncontrolled fields.
2. Keep fields controlled in local state, or return only the values needed to restore the form. With useActionState, return those values with the field errors and use them as the new defaultValue. Keep passwords out of the response.
3. Keep the inline error attached to Work email and let the person edit that answer in place before submitting again.

## Before you ship

1. Enter Maya Chen, maya@, and Acme Design in a form whose validation runs after submission. Press Continue and wait for the Work email error. Are all three values still in their fields?
2. Can you finish the address and submit again by editing only Work email?
3. Does a failed response after a second attempt preserve the most recently submitted values?
