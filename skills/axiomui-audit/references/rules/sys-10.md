# Recover at the point of failure

- ID: sys-10
- Category: System & logic
- Tags: Error handling, Images, Async
- URL: https://axiomui.nischal.fyi/rules/sys-10

When part of a view fails, preserve the content that still works. Identify the unavailable information and offer a retry or another route when it can help.

- Do: Placeholder image + retry option
- Don't: Broken image icon / blank screen

## Why it works

A missing decorative image and a missing invoice total have very different consequences. Reserving media dimensions can keep a product grid stable. A missing required value needs an explicit unavailable state so nobody mistakes a blank for zero.

- [W3C WAI · Choosing image alternatives](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [Stripe · Idempotent requests](https://docs.stripe.com/api/idempotent_requests)

## What breaks

A decorative placeholder used in place of a diagram can hide the only explanation of a task. An unrestricted retry on a nonrepeatable action can also duplicate the operation.

## How to apply it

1. Reserve image dimensions and provide an appropriate text alternative for informative images.
2. Keep usable content in place and distinguish failure from loading or an empty result.
3. Offer a scoped retry for recoverable failures and an alternative for persistent ones.

## Review questions

1. What information does the missing resource carry?
2. Can the rest of the task continue safely?
3. Is another attempt likely to help, and is it safe to repeat?
