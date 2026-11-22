# Apply multiple filters together

- ID: mobile-19
- Category: Mobile
- Tags: Filters, Selection
- URL: https://axiomui.nischal.fyi/rules/mobile-19

When filters live in a sheet, closing it on each choice makes people reopen it to finish the task. Keep a draft selection and show what applying it will return.

- Do: Choose three filters · apply once
- Don’t: Three choices · sheet closes three times

## Why it works

A shopper looking for black shoes in size 9 under $120 can see how many pairs match while all three choices are still in front of them.

- [Baymard, Apply buttons in mobile filtering interfaces](https://baymard.com/guidelines/1125-apply-buttons-in-mobile-filtering-interfaces)
- [Baymard, Ecommerce filter UI](https://baymard.com/blog/ecommerce-filter-ui)
- [Baymard, Applied filters](https://baymard.com/blog/how-to-design-applied-filters)
- [eBay Playbook, Filtering](https://playbook.ebay.com/design-system/patterns/filtering-patterns)

## What breaks

The sheet closes between choices and makes the shopper find the remaining filters again.

## How to apply it

1. iOS — Keep the sheet’s pending selection while the person reviews the count and allow Cancel to discard it.
2. Android — Keep Apply reachable above the current bottom inset and preserve the list behind the modal.
3. Web — Derive the result count from the same predicate as the result list. Handle zero results and clearing a filter.

## Before you ship

1. How many times must you reopen the filters?
2. Does Cancel discard pending choices?
3. Does the count on Show pairs match the list after applying, even when no pairs match?
