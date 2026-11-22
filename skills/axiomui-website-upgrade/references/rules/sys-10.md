# Contain a failure to the part that failed

- ID: sys-10
- Category: System & logic
- Tags: Error handling, Images, Async
- URL: https://axiomui.nischal.fyi/rules/sys-10

Keep the content that loaded. Say which part failed and offer Retry there, or another way to continue.

- Do: Image keeps its space · Reload image
- Don’t: Broken image icon and hero@2x.jpg · article title shifts up

## Why it works

Reserve space for a failed image so the article title stays in place. For a missing invoice total, show that the amount is unavailable so nobody reads a blank as zero.

- [Cloudscape · Errors](https://cloudscape.design/patterns/general/errors/)
- [React · Error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [W3C WAI · Choosing image alternatives](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [Stripe · Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [web.dev · Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls)

## What breaks

A placeholder where a setup diagram failed can hide the only instructions. Retrying a payment that already went through can charge someone twice.

## How to apply it

1. Set image dimensions or an aspect ratio. Give informative images alt text that conveys what the reader needs from them.
2. Keep usable content in place and distinguish failure from loading or an empty result.
3. Put Retry on the part that failed. If another attempt is unlikely to help, offer another route, such as a download link.

## Before you ship

1. What information does the missing resource carry?
2. Can the rest of the task continue safely?
3. Is another attempt likely to help, and is it safe to repeat?
