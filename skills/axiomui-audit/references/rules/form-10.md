# Give the form one clear reading order

- ID: form-10
- Category: Forms & inputs
- Tags: Forms, Efficiency
- URL: https://axiomui.nischal.fyi/rules/form-10

Stack unrelated questions so the next field is obvious. Group related short fields on one row only when their reading order, focus order and reflow remain clear.

- Do: Single column, stacked fields
- Don't: Two columns of unrelated fields

## Why it works

In a two-column form, someone may scan across rows while Tab moves down the first column. Choosing one clear sequence reduces the need to reconstruct the form’s order. A compact group such as parts of one date can still read as one question.

- [WCAG 2.2 · Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [W3C Internationalization · Personal names around the world](https://www.w3.org/International/questions/qa-personal-names)

## What breaks

A user following the visible sequence may discover a required question several fields later when the keyboard moves somewhere unexpected. Zoom can make that mismatch more disorienting.

## How to apply it

1. Arrange fields in meaningful document order before applying a grid.
2. Pair fields only when the task and supported locales give the grouping a clear meaning.
3. Test the sequence at full width, narrow width and with enlarged text.

## Review questions

1. Can someone predict the next question?
2. Does Tab preserve a meaningful order after reflow?
3. Do the grouped fields belong together in the locales supported?
