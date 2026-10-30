# Toast vs inline error

- ID: comp-6
- Category: Components & actions
- Tags: Error handling, Feedback
- URL: https://axiomui.nischal.fyi/rules/comp-6

Toasts are for system-level news (saved, disconnected); inline errors are for a field the user has to fix. An error has to appear where the fix happens, because a toast is gone before they get there.

- Do: Invalid email = inline, under the field
- Don't: Invalid email = toast, far from the field

## Why it works

Toasts float above the whole screen and fit system-level updates like a save confirmation, but that same detachment from any specific element makes them useless for pointing at one wrong field. Inline errors sit right where the mistake lives, so the fix location and the error message are never more than a glance apart.

## What breaks

Showing an invalid email error as a toast leaves users staring at a form with no visible red flag, so they resubmit blind and the same toast reappears without ever revealing which field is wrong.

## How to apply it

1. Use a toast for system-level updates like a network error or a Saved confirmation.
2. Use an inline error directly beneath the field for issues like an invalid email.
3. Never route field-specific validation errors through the toast system.
4. Keep inline errors visible until the specific field is corrected.

## Review questions

1. Do system-level updates like save confirmations appear as toasts?
2. Does the invalid email error show inline, next to the field itself?
3. Is any field-specific error message sitting far from its field?
