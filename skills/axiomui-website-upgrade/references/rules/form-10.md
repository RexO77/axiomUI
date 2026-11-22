# Give the form one clear reading order

- ID: form-10
- Category: Forms & inputs
- Tags: Forms, Efficiency
- URL: https://axiomui.nischal.fyi/rules/form-10

Stack unrelated fields in one column. Short related fields can share a row if Tab follows reading order and the fields stay readable on narrow screens.

- Do: One column · Tab follows reading order
- Don’t: Two columns · Tab order differs from reading order

## Why it works

In the two-column form, Company sits beside Full name, but Tab moves down to Work email. One column gives both paths the same order. Parts of one date can still share a row.

- [Baymard · Multicolumn form layouts](https://baymard.com/research-articles/avoid-multi-column-forms)
- [WCAG 2.2 · Meaningful sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)
- [WCAG 2.2 · Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## What breaks

Someone reading across a row can lose their place when Tab moves down instead. At high zoom, the next field may be outside the area they were reading.

## How to apply it

1. Arrange fields in meaningful document order before applying a grid.
2. Group fields that belong together, such as the parts of a date. Use the order people expect in each supported locale.
3. Test the sequence at full width, narrow width and with enlarged text.

## Before you ship

1. Can someone predict the next question?
2. Does Tab preserve a meaningful order after reflow?
3. Do the grouped fields belong together in the locales supported?
