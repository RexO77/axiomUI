# Accept a one-time code in one paste

- ID: form-13
- Category: Forms & inputs
- Tags: Authentication, Accessibility, Form fields
- URL: https://axiomui.nischal.fyi/rules/form-13

Accept the whole one-time code in one paste, even across separate boxes. Keep leading zeros and support autofill where available.

- Do: One paste fills all six digits, including the leading zero
- Don’t: One paste fills only the first box

## Why it works

A person signing in can copy a code from their authenticator once. If six boxes each accept one character, pasting 012345 into the first box may leave only 0. The visual grouping can stay the same while one text field accepts the complete code.

- [WCAG 2.2 · Accessible authentication (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- [W3C WAI · Failure to accept a complete code](https://www.w3.org/WAI/WCAG22/Techniques/failures/F109)
- [Chrome for Developers · SMS OTP forms](https://developer.chrome.com/docs/modern-web-guidance/guides/forms/sms-otp-form)
- [HTML · Autofill field names](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)

## What breaks

If pasting fills just one box, the person must type the other five digits. Even when all six arrive, converting 012345 to a number drops the leading zero.

## How to apply it

1. For a digit-only code, use a labeled text field with `inputmode="numeric"` and `autocomplete="one-time-code"`. Carry the value as a string through submission.
2. If the design uses separate input boxes, distribute a full paste in order and allow keyboard correction. Verify paste with a code copied from the source users actually receive.
3. Test every sign-in step for an existing account, including password-manager fill. For a one-time code, accepting a full paste is one way to meet WCAG 2.2 criterion 3.3.8.

## Before you ship

1. Can you paste 012345, correct a digit and submit the code with its leading zero intact?
2. Does signing in with a saved password work before the code step?
3. If one sign-in method requires retyping the code, which method lets someone skip that step?
