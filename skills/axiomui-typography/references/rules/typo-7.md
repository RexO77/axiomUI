# Align comparable numbers

- ID: typo-7
- Category: Typography & text
- Tags: Alignment, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-7

Align amounts at the numeric end of a column and use tabular figures when the font supports them. With consistent fractional precision, corresponding place values then line up.

- Do: font-variant-numeric: tabular-nums
- Don't: font-variant-numeric: proportional-nums

## Why it works

The amounts in the preview already share a right edge. Equal-width digits keep the two decimal places aligned even as narrow 1s give way to wider 8s. Account numbers and phone numbers are identifiers and invite different grouping decisions.

- [GOV.UK · Tables with numeric columns](https://design-system.service.gov.uk/components/table/)
- [CSS Fonts · Numeric glyph variants](https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop)

## What breaks

A column mixing whole amounts, two decimals, currency suffixes, and negative signs can look neatly right-aligned while its decimal marks still wander. Adding trailing zeroes to measurements can falsely imply precision.

## How to apply it

1. Format comparable currency values consistently for the locale.
2. Give amounts a common alignment edge and verify the font provides tabular figures.
3. Use explicit decimal alignment when different precision levels carry meaning.

## Review questions

1. Do the decimal marks line up in representative amounts?
2. Do negative values and localized currency symbols still fit?
3. Would adding a zero change what the number implies?
