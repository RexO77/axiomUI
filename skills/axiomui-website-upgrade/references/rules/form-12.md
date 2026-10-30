# Success state feedback

- ID: form-12
- Category: Forms & inputs
- Tags: Feedback, States
- URL: https://axiomui.nischal.fyi/rules/form-12

Show positive confirmation after successful submission (not just absence of errors). Users need to know it worked.

- Do: Green checkmark + “Saved successfully”
- Don't: Form just resets silently

## Why it works

The absence of an error is not the same signal as confirmation of success, so a form that just resets silently leaves users to infer success from nothing happening. An explicit green checkmark with Saved successfully closes the loop the user opened by submitting, giving positive proof rather than an inferred guess. This matters most after actions with real consequences, where uncertainty about whether it worked drives repeat submissions.

## What breaks

A settings form resets silently after saving, so the user assumes it failed and clicks submit again, potentially double-processing the update.

## How to apply it

1. Show a green checkmark with the message Saved successfully after a successful submission.
2. Never let the form just reset silently as the only sign of completion.
3. Keep the success state visible long enough to register, not a flash reset.
4. Apply this to any state-changing action, not just full-page form submits.

## Review questions

1. Does a successful submission show explicit confirmation like a checkmark and message?
2. Is silent form reset ever the only feedback given after submitting?
3. Does the success message stay visible long enough for the user to notice it?
