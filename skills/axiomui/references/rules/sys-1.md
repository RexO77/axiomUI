# Choose a loading state that explains the wait

- ID: sys-1
- Category: System & logic
- Tags: Perceived performance, Async, States
- URL: https://axiomui.nischal.fyi/rules/sys-1

Use a skeleton when the incoming layout is predictable. An indeterminate indicator fits an operation whose duration is unknown. Use measured progress when the amount of work completed is available.

- Do: Skeleton shaped like the incoming content
- Don't: Spinner replaces the whole content area

## Why it works

Both example panes wait 900ms. One reserves the spaces where the title and content will appear. The other communicates activity alone. The skeleton gives an early map of the page, without measuring the request’s progress.

- [IBM Carbon · Loading patterns](https://www.carbondesignsystem.com/building-blocks/core/patterns/loading)

## What breaks

A skeleton shaped like a dense list can be misleading if the result is an empty search. A spinner that replaces the whole page during a background refresh also removes information someone could still use.

## How to apply it

1. Preserve useful loaded content during refresh.
2. Reserve space for predictable content and respect reduced-motion preferences.
3. Give slow or failed operations an accessible status and a recovery path.

## Review questions

1. Does the loading treatment accurately describe what is known?
2. Can someone keep using content that has already loaded?
3. What appears if the request fails or returns no records?
