# Fit leading to wrapped headings

- ID: typo-4
- Category: Typography & text
- Tags: Headings, Spacing
- URL: https://axiomui.nischal.fyi/rules/typo-4

Set heading leading with a two- or three-line title. Start tighter than paragraph leading if that keeps the title together, and leave clearance for the tallest marks in the supported scripts.

- Do: 22px / 24px line-height (1.1x)
- Don't: 22px / 33px line-height (1.5x)

## Why it works

At 22px, the sample’s 24px lines form a compact heading. Increasing the leading to 33px changes the relationship between its two lines even though the words and weight stay the same. A font with taller marks can need more room for the same title.

- [IBM Carbon · Type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets)

## What breaks

A one-line mockup can hide collisions until a heading wraps in translation. Excess leading can make the second line look as closely related to the following paragraph as to the first line.

## How to apply it

1. Set separate heading and body tokens when they serve different reading tasks.
2. Try a long title with capitals, accents, and descenders.
3. Compare the space within the heading with the space between it and the body.

## Review questions

1. Do both lines still read as one title?
2. Do accented capitals and descending marks clear adjacent lines?
3. Does the heading remain intact when enlarged?
