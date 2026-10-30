# Loading states on buttons

- ID: comp-9
- Category: Components & actions
- Tags: Buttons, States, Async
- URL: https://axiomui.nischal.fyi/rules/comp-9

Buttons that trigger async actions should show a spinner/loading state and disable re-click. Never leave a button looking clickable during submission.

- Do: Spinner + disabled during submit
- Don't: Static button allows double-click

## Why it works

A static button during an async submit gives no feedback that the click registered, so users interpret silence as failure and click again, firing duplicate requests. A spinner plus disabled state closes that feedback loop immediately, showing the system received the action and is working on it.

## What breaks

A save button that stays static and clickable during submission invites a second click before the first request resolves, creating duplicate records or double-charged actions on the backend.

## How to apply it

1. Spin on any submit that changes server state — an order, a payment, a save — where a second click would fire a second request. A cheap reversible toggle has nothing to double, so it needs no spinner.
2. Put the spinner beside the label rather than replacing it, or reserve the resting width, so the button does not collapse mid-submit.
3. Disable the button for the life of the request and set aria-busy, so the state is announced and not only drawn.
4. Restore the resting state on failure as well as success, and surface the error next to the button.

## Review questions

1. Does the button show a spinner while the request is in flight?
2. Is the button disabled during submission, so a second click cannot fire?
3. Does the button return to its resting state on failure as well as on success?
