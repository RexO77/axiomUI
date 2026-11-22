# Show changes before the server confirms them

- ID: sys-9
- Category: System & logic
- Tags: Perceived performance, Async, Feedback
- URL: https://axiomui.nischal.fyi/rules/sys-9

For a low-risk action like liking a post, show the change immediately. If saving fails, say so and show the last confirmed state. If someone taps again, keep their latest choice when earlier replies arrive.

- Do: Heart starts filling at 0ms · Synced starts appearing at 700ms
- Don’t: Spinner until the heart starts filling at 560ms

## Why it works

The heart starts filling at 0ms. Synced starts appearing at 700ms. Between those events, the save can fail or the person can change their mind.

- [React · Optimistic updates and error recovery](https://react.dev/reference/react/useOptimistic)
- [TanStack Query · Optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Apollo GraphQL · Optimistic mutation results](https://www.apollographql.com/docs/react/performance/optimistic-ui)
- [React · Out-of-order transition updates](https://react.dev/reference/react/useTransition)
- [Simon Hearne · Optimistic UI patterns](https://simonhearne.com/2021/optimistic-ui-patterns/)

## What breaks

An older reply can undo a second tap if you apply replies in arrival order. If the heart empties silently after a failed save, someone who looked away may still think they liked the post.

## How to apply it

1. Track what the person last chose and what the server last confirmed.
2. If someone taps twice, keep the second choice even if the first reply arrives last. Apply the same rule to retries.
3. If saving fails, show the last confirmed state, explain what failed and offer Retry when another attempt can help.

## Before you ship

1. Is the action low-risk and reversible enough to show before the server confirms it?
2. If someone taps twice, can a late reply undo their second tap?
3. Can the person tell what was actually saved after failure?
