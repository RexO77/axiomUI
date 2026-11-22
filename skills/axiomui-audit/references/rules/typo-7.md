# Line up amounts in a column

- ID: typo-7
- Category: Typography & text
- Tags: Alignment, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-7

Right-align prices in the same currency and use the same number of decimal places. If the font supports tabular digits, turn them on so each digit takes the same width.

- Do: font-variant-numeric: tabular-nums
- Don’t: font-variant-numeric: proportional-nums

## Why it works

Both examples right-align prices to two decimal places. With proportional digits, the 1 and 8 take different widths, so .10 and .08 can start at different points. Tabular digits line up the decimal points.

- [Adobe Spectrum · Applying the type system](https://spectrum.adobe.com/foundations/typography/applying-the-type-system)
- [CSS Fonts · Numeric glyph variants](https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop)
- [OpenType · Tabular figures](https://learn.microsoft.com/en-us/typography/opentype/spec/features_pt#tag-tnum)
- [GOV.UK · Tables with numeric columns](https://design-system.service.gov.uk/components/table/)
- [Unicode CLDR · Numbers](https://www.unicode.org/reports/tr35/tr35-numbers.html)

## What breaks

Even right-aligned amounts can have uneven decimal points if some are whole numbers, others have two decimals, or currency symbols follow the amount. Adding zeros to measurements can imply more precision than you have.

## How to apply it

1. Format comparable currency values consistently for the locale.
2. Give amounts a common alignment edge and verify the font provides tabular figures.
3. When measurements use different numbers of decimal places, align them on the decimal point.

## Before you ship

1. Do the decimal marks line up in representative amounts?
2. Do negative values and localized currency symbols still fit?
3. Would adding a zero change what the number implies?
