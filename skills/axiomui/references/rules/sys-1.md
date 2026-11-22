# Choose a loading state that explains the wait

- ID: sys-1
- Category: System & logic
- Tags: Perceived performance, Async, States
- URL: https://axiomui.nischal.fyi/rules/sys-1

Use a skeleton when you know the layout. Show a progress bar when you can measure the work completed. Use a spinner when all you can say is that work is underway.

- Do: Skeleton shaped like the incoming content
- Don’t: Spinner replaces the whole content area

## Why it works

Both previews wait 900ms. The skeleton reserves three lines at their final widths, so the text lands in place. The spinner shows activity. Neither tells you how much work remains.

- [IBM Carbon · Loading patterns](https://www.carbondesignsystem.com/building-blocks/core/patterns/loading)
- [Android Developers · Progress indicators](https://developer.android.com/develop/ui/compose/components/progress)
- [NN/g · Skeleton screens](https://www.nngroup.com/articles/skeleton-screens/)
- [TanStack Query · Paginated queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## What breaks

A skeleton full of rows promises results even when the search may be empty. A spinner that replaces the page during a refresh hides content someone may still be reading.

## How to apply it

1. Preserve useful loaded content during refresh.
2. Match the skeleton to the incoming layout. Turn off its pulse when someone requests reduced motion.
3. Announce a slow load or failure in a live region. Offer Retry when another attempt can help.

## Before you ship

1. When the content arrives, does it fit the space the skeleton reserved?
2. Can someone keep using content that has already loaded?
3. What appears if the request fails or returns no records?
