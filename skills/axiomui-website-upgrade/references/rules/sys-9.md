# Optimistic UI updates

- ID: sys-9
- Category: System & logic
- Tags: Perceived performance, Async, Feedback
- URL: https://axiomui.nischal.fyi/rules/sys-9

For low-risk actions (like/favorite/toggle), update the UI immediately and reconcile with the server in the background.

- Do: Heart fills instantly, syncs async
- Don't: Spinner on every like button click

## Why it works

For low-risk, high-frequency actions like favoriting, updating the UI immediately and reconciling with the server afterward removes the perceived latency of a round trip, since the heart fills instantly rather than waiting on a spinner. This trades a rare silent rollback for a consistently snappy feel on actions users repeat often.

## What breaks

A heart that waits 560ms on the server before it fills leaves half a second of nothing after the tap, so the user taps again to check it registered — and the second tap unlikes the post they meant to like.

## How to apply it

1. Update the heart or toggle state instantly on click, syncing to the server asynchronously.
2. Reserve optimistic updates for low-risk, reversible actions like likes or favorites.
3. Silently roll back and notify only if the background sync actually fails.
4. Never show a loading spinner for single-tap toggle interactions.

## Review questions

1. Does the like or favorite icon change state instantly on tap?
2. Is there no spinner shown while a toggle action syncs in the background?
3. Does a failed sync roll back the state without a jarring error dialog?
