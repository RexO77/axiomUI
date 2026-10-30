# Validate on blur

- ID: form-8
- Category: Forms & inputs
- Tags: Validation, Timing, Error handling
- URL: https://axiomui.nischal.fyi/rules/form-8

Inline validation should fire when the user leaves a field, not on every keystroke. Nobody types a valid email on the first character, so per-keystroke validation shows an error for the whole time it is being fixed.

- Do: Error appears after leaving field
- Don't: Error flashes on first character

## Why it works

Validating on every keystroke interrupts a user mid-thought, flashing an error while they have only typed the first character of a valid entry. Waiting until the field loses focus, on blur, respects the fact that a partial input is not yet a wrong input. This timing distinguishes between still-composing and finished, which is the actual moment an error becomes meaningful.

## What breaks

An email field flashes an invalid error the instant a user types the letter j, so they see red before they have had a chance to finish typing their own address.

## How to apply it

1. Trigger validation errors only after the user leaves the field (on blur).
2. Never fire an error message on the first character typed.
3. Allow real-time positive feedback (like a checkmark) once the field is valid, but keep negative feedback deferred.
4. Test by typing slowly into a required field and confirming no error appears mid-entry.

## Review questions

1. Does the error message wait until the user leaves the field before appearing?
2. Does typing the first character ever trigger a visible error?
3. Is validation timing consistent across every field on the form?
