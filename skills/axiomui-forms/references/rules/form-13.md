# Accept a complete sign-in code in one paste

- ID: form-13
- Category: Forms & inputs
- Tags: Authentication, Accessibility, Form fields
- URL: https://axiomui.nischal.fyi/rules/form-13

Let people paste a one-time code as they receive it. Keep leading zeros and support autofill where available. A design with separate boxes can still accept the entire code in one operation.

- Do: One paste fills all six digits, including the leading zero
- Don't: One paste fills only the first box

## Why it works

A person signing in can copy a code from their authenticator once. If six boxes each accept one character, pasting 012345 into the first box may leave only 0. The visual grouping can stay the same while one text field accepts the complete code.

- [WCAG 2.2 · Accessible authentication (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- [W3C WAI · Failure to accept a complete code](https://www.w3.org/WAI/WCAG22/Techniques/failures/F109)

## What breaks

The person must look back and forth between the sign-in page and the authenticator. Casting a code to a number introduces a second failure by dropping its leading zero, even when all six characters were pasted.

## How to apply it

1. For a digit-only code, use a labeled text field with `inputmode="numeric"` and `autocomplete="one-time-code"`. Carry the value as a string through submission.
2. If the design uses separate input boxes, distribute a full paste in order and allow keyboard correction. Verify paste with a code copied from the source users actually receive.
3. Check the entire existing-account sign-in flow, including password-manager fill. WCAG 2.2 allows an assisting mechanism or another qualifying path when a step requires a cognitive test; the criterion also has specific recognition exceptions.

## Review questions

1. Can a person paste 012345 once, correct a digit and submit the intended string?
2. Does signing in with a saved password work before the code step?
3. If transcription is required on one path, which available path lets someone complete authentication without it?
