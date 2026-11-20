# Choose a timestamp for the question

- ID: sys-4
- Category: System & logic
- Tags: Clarity, Semantics
- URL: https://axiomui.nischal.fyi/rules/sys-4

Use relative time when recency matters and a localized date or time when someone needs a record. Make the exact timestamp available on touch and keyboard when the distinction matters.

- Do: Activity: 2m ago
- Don't: Activity: yyyy-mm-ddThh:mm:ssZ

## Why it works

“Two minutes ago” answers whether a file has just changed. Comparing an invoice with a bank record requires a stable date and sometimes a time zone. A single timestamp can support both views without changing the underlying instant.

- [ECMA-402 · Relative time formatting](https://tc39.es/ecma402/#relativetimeformat-objects)
- [ECMA-402 · Date and time formatting](https://tc39.es/ecma402/#datetimeformat-objects)

## What breaks

Relative labels become ambiguous in a screenshot or an audit trail. A raw UTC string can also hide a day boundary for someone working in another zone.

## How to apply it

1. Store an unambiguous instant for events and handle calendar-only dates as dates.
2. Format for the reader’s locale and specify the relevant time zone for exact records.
3. Offer a persistent detail or focusable disclosure when a relative label needs an exact counterpart.

## Review questions

1. Is the task about recency or a specific point in time?
2. Which time zone determines the displayed date?
3. Can someone obtain the exact time without a mouse?
