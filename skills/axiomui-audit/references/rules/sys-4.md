# Date formats

- ID: sys-4
- Category: System & logic
- Tags: Clarity, Semantics
- URL: https://axiomui.nischal.fyi/rules/sys-4

Use relative dates (2 hours ago) where recency is the point, and absolute dates (12 Jan 2024) where the record is. A feed answers 'is this fresh?'; an audit log answers 'which day?'.

- Do: Activity: 2m ago
- Don't: Activity: yyyy-mm-ddThh:mm:ssZ

## Why it works

Temporal distance changes how people process time: recent events are judged relative to now, 2 hours ago, while distant ones need an anchor in absolute time, 12 Jan 2024, to stay meaningful. Activity feeds benefit from relative recency cues; historical records need the fixed date so context survives after the moment passes.

## What breaks

An activity row stamped 2026-08-10T14:02:11Z cannot answer whether that was a minute ago or last month without the reader subtracting two timestamps in their head, and in the fixed-width slot the row gives it, the string truncates before the clock time even arrives.

## How to apply it

1. Use relative timestamps like 2m ago for comments and activity feeds under a day or two old.
2. Switch to absolute dates such as 12 Jan 2024 once an item ages past that window.
3. Show the absolute date in a tooltip on hover over any relative timestamp.
4. Always use absolute dates for invoices, contracts, and other historical records.

## Review questions

1. Do recent activity items show relative time like 2m ago rather than a full date?
2. Do historical or archival records show a fixed absolute date?
3. Does hovering a relative timestamp reveal the exact date and time?
