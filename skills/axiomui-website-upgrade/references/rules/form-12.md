# Confirm the outcome of a submission

- ID: form-12
- Category: Forms & inputs
- Tags: Feedback, States
- URL: https://axiomui.nischal.fyi/rules/form-12

After the service confirms a save, show the outcome where the user can find it. For a completed transaction, include the reference or next step they may need later.

- Do: Green checkmark + “Saved successfully”
- Don't: Saved value stays on screen without confirmation

## Why it works

An unchanged edit form can look identical before and after a successful save. “Saved successfully” distinguishes those states. A booking may require more, such as the reference needed to make a change.

- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [GOV.UK · Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)

## What breaks

A generic success message shown when a request starts can contradict a later rejection. Clearing the fields early also destroys the information needed to try again.

## How to apply it

1. Distinguish pending, saved and failed states.
2. Announce a meaningful inline completion message without moving focus unnecessarily.
3. For a completed transaction, provide a durable confirmation and explain what happens next.

## Review questions

1. Was success confirmed by the service?
2. Can someone perceive the outcome without seeing the icon?
3. Can they recover the reference or next step later?
