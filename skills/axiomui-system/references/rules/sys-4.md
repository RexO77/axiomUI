# Use relative time for activity, dates for records

- ID: sys-4
- Category: System & logic
- Tags: Clarity, Semantics
- URL: https://axiomui.nischal.fyi/rules/sys-4

Use relative time to show how recent an event is. For a record, show the date or time in the reader's locale. If a relative label needs an exact time, make it available by touch and keyboard.

- Do: Activity: 2m ago
- Don’t: Activity: 2026-08-10T14:02:11Z

## Why it works

“2m ago” tells you how recently Maya pushed to main. Matching an invoice to a bank record needs an exact date and sometimes a time zone. One stored timestamp can supply either format.

- [GitLab Pajamas · Date and time](https://design.gitlab.com/content/date-and-time/)
- [GitHub Primer · Relative time](https://primer.style/product/components/relative-time/guidelines/)
- [ECMA-402 · Relative time formatting](https://tc39.es/ecma402/#relativetimeformat-objects)
- [ECMA-402 · Date and time formatting](https://tc39.es/ecma402/#datetimeformat-objects)
- [MDN · HTML title attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title)

## What breaks

Relative labels become ambiguous in a screenshot or an audit trail. A raw UTC string can also hide a day boundary for someone working in another zone.

## How to apply it

1. Store events as unambiguous instants. Store calendar dates, such as birthdays, without a time or time zone.
2. Format for the reader’s locale and specify the relevant time zone for exact records.
3. Show the exact time alongside the relative label or behind a control people can open by touch or keyboard.

## Before you ship

1. Is the task about recency or a specific point in time?
2. Which time zone determines the displayed date?
3. Can someone obtain the exact time without a mouse?
