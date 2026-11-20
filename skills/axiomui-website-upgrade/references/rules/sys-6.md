# Make reversible deletion recoverable

- ID: sys-6
- Category: System & logic
- Tags: Safety, Error handling
- URL: https://axiomui.nischal.fyi/rules/sys-6

Offer immediate Undo for a reversible removal and keep a discoverable recovery path when the notice expires. Confirm consequential actions that cannot be reliably reversed.

- Do: Moved to Trash with immediate Undo
- Don't: Deleted → gone, no undo

## Why it works

A short Undo notice is convenient for the person who catches a mistake immediately. A Trash folder covers someone who returns later or needs more time to reach the control. Both depend on the service retaining enough state to restore the original item.

- [WCAG 2.2 · Error prevention (legal, financial, data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [WCAG 2.2 · Timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)

## What breaks

A five-second notice as the only recovery route can expire before a keyboard or screen-reader user reaches it. Client-side restoration can also mislead if the server has already erased the item or its permissions.

## How to apply it

1. Define what restoration recovers and for how long.
2. Make Undo keyboard accessible and provide durable recovery when the transient control is missed.
3. Reserve a confirmation or review step for consequences that cannot be undone.

## Review questions

1. Can the item be restored after the notice vanishes?
2. Do restored content and access match their prior state?
3. Does the user know when deletion becomes permanent?
