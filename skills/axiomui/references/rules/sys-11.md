# Set breakpoints where the layout needs them

- ID: sys-11
- Category: System & logic
- Tags: Responsive, System, Mobile
- URL: https://axiomui.nischal.fyi/rules/sys-11

Resize the content until it no longer works, then choose a reflow that solves the failure. The example uses 640px and 1024px. A different interface may need different thresholds or none.

- Do: 2 breakpoints: 640px / 1024px (3 tiers)
- Don't: 8 breakpoints, one per device

## Why it works

A sidebar can stop fitting because its labels grow, the text is enlarged or the surrounding container narrows. Device names do not capture any of those conditions. A useful breakpoint describes a change the content needs.

- [web.dev · Media queries](https://web.dev/learn/design/media-queries)
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## What breaks

A layout tuned only on a list of popular phone widths can wrap an action bar or clip a label between those widths. Extra tiers are justified when each one addresses a distinct problem.

## How to apply it

1. Test continuous ranges with real content, translations and larger text.
2. Prefer intrinsic wrapping or layout sizing when it solves the problem without a query.
3. Use a container query when the relevant constraint is a component’s allocated space.

## Review questions

1. What breaks immediately before this change?
2. Does the layout recover on both sides of the threshold?
3. Does an embedded instance still work in a narrower parent?
