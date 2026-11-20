# Reconcile optimistic changes

- ID: sys-9
- Category: System & logic
- Tags: Perceived performance, Async, Feedback
- URL: https://axiomui.nischal.fyi/rules/sys-9

For a low-risk, reversible action, show the intended state immediately when you can reconcile it with the service. Make a failed or superseded action understandable.

- Do: Heart fills instantly, syncs async
- Don't: Spinner on every like button click

## Why it works

Filling a heart at the tap gives immediate feedback. The saved favorite is a separate fact that the server confirms later. Designing both states forces the team to decide what the person sees if the connection drops or they tap again.

- [React · Optimistic updates and error recovery](https://react.dev/reference/react/useOptimistic)

## What breaks

If the first response arrives after a second tap, applying responses in arrival order can reverse the person’s latest choice. A silent rollback can leave someone convinced an item is saved when it is absent from Favorites.

## How to apply it

1. Track pending intent separately from confirmed state.
2. Reconcile retries and out-of-order responses with the latest intended value.
3. If persistence fails, show the actual state with a concise explanation and an appropriate retry.

## Review questions

1. Is the result safe to predict?
2. Does a rapid second action survive a late response?
3. Can the person tell what was actually saved after failure?
