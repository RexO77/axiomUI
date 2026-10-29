# Numeric alignment

- ID: typo-7
- Category: Typography & text
- Tags: Alignment, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-7

Use tabular (monospaced) figures or right-align numbers in tables so decimals stack. Aligned digits let the eye compare magnitudes without reading every value.

- Do: font-variant-numeric: tabular-nums
- Don't: font-variant-numeric: proportional-nums

## Why it works

Proportional fonts give each digit a different width, so a column of prices drifts out of vertical alignment as digit widths vary row to row. Tabular nums fix every digit to the same width, letting decimal points and place values stack into a clean vertical line the eye can scan down.

## What breaks

In a proportional table, 1 takes less width than 8, so decimal points shift left and right down the column, and comparing two prices at a glance becomes an actual counting exercise.

## How to apply it

1. Apply font-variant-numeric: tabular-nums to any numeric table or list.
2. Right-align number columns so digits stack from the decimal outward.
3. Never leave numeric tables on standard proportional sans figures.
4. Test alignment with a mix of 1-digit and multi-digit values in the same column.

## Review questions

1. Do decimal points line up vertically down the column?
2. Is font-variant-numeric: tabular-nums applied to numeric tables?
3. Are number columns right-aligned rather than left or center?
