# Keep entered answers when validation fails

- ID: form-15
- Category: Forms & inputs
- Tags: Validation, Error handling
- URL: https://axiomui.nischal.fyi/rules/form-15

When validation fails, show every submitted answer so the person can correct it in place. Mark the fields that need attention.

- Do: Error on Work email · all answers kept
- Don't: Error on Work email · every field cleared

## Why it works

When Work email comes back with a format error, leaving maya@ in place lets the person see what was missing and finish the address. Preserving Full name and Company lets them submit again after that one correction.

- [GOV.UK · Validation pattern](https://design-system.service.gov.uk/patterns/validation/)
- [React · Preserving form values after an Action](https://react.dev/reference/react-dom/components/form#preserving-form-values-after-an-action)

## What breaks

A reset erases the address the error refers to and makes the person re-enter answers that already passed validation.

## How to apply it

1. Search for <form action=, formAction=, and reset() in submit handlers. In React 19, an action that completes without throwing resets uncontrolled inputs by default, even when it returns a validation error.
2. Keep fields controlled in local state, or return the submitted values alongside field errors from the action. With useActionState, pass those returned values to the inputs as their new defaultValue.
3. Keep the inline error attached to Work email and let the person edit that answer in place before submitting again.

## Review questions

1. Enter Maya Chen, maya@, and Acme Design in a form whose validation runs after submission. Press Continue and wait for the Work email error. Are all three values still in their fields?
2. Can you finish the address and submit again by editing only Work email?
3. Does a failed response after a second attempt preserve the most recently submitted values?
