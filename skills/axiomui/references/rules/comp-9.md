# Show when a submission is in progress

- ID: comp-9
- Category: Components & actions
- Tags: Buttons, States, Async
- URL: https://axiomui.nischal.fyi/rules/comp-9

Show when a submission starts and block repeats while it’s pending. Show “Saved” only after the server confirms success.

- Do: Submit dims and a spinner replaces its label
- Don’t: Submit briefly shrinks, then looks ready again

## Why it works

A spinner tells someone their order is being submitted. If the connection drops and they retry, the server still needs to recognize the original order.

- [IBM Carbon · Inline loading](https://www.carbondesignsystem.com/building-blocks/core/components/inline-loading/guidelines)
- [GitLab Pajamas · Loading buttons](https://design.gitlab.com/components/button/#loading)
- [Stripe · Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [GOV.UK · Error messages](https://design-system.service.gov.uk/components/error-message/)

## What breaks

A connection can drop after a payment succeeds but before the receipt reaches the browser. Disabling the original button cannot make a later retry safe.

## How to apply it

1. Keep the button the same size and announce the pending state to screen readers, for example “Submitting…”.
2. Block repeat submissions while a request is pending. Have the server recognize retries so the same order or payment goes through only once.
3. Announce success only after confirmation. If the request fails, keep the entered values and explain how to retry.

## Before you ship

1. Does the user know the request is still pending?
2. Can a retry create the same order twice?
3. Can someone recover after a timeout without re-entering the form?
