# Acknowledge a pending submission

- ID: comp-9
- Category: Components & actions
- Tags: Buttons, States, Async
- URL: https://axiomui.nischal.fyi/rules/comp-9

Acknowledge a submission while it is pending and prevent accidental repeats. Keep “Saving” distinct from “Saved” until the service confirms the result.

- Do: Spinner + disabled during submit
- Don't: Static button allows double-click

## Why it works

A submit control has two audiences. The person needs to know whether the request started, and the service needs to know whether a retry represents the same operation. A spinner can answer the first question. The server must handle the second.

- [Stripe · Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## What breaks

A connection can drop after a payment succeeds but before the receipt reaches the browser. Disabling the original button cannot make a later retry safe.

## How to apply it

1. Keep a meaningful label and preserve the button’s dimensions during loading.
2. Prevent duplicate activation while pending and give important operations an idempotent server contract.
3. Expose a meaningful status, preserve input on failure and tell the user how to recover.

## Review questions

1. Does the user know the request is still pending?
2. Can a retry create the same order twice?
3. Can someone recover after a timeout without re-entering the form?
