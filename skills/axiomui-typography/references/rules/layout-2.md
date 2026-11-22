# Set a measure for long-form text

- ID: layout-2
- Category: Layout & spacing
- Tags: Readability, Responsive
- URL: https://axiomui.nischal.fyi/rules/layout-2

Limit the width of sustained prose on wide screens. Around 65 characters per line is a useful starting point for English paragraphs. Check the actual text because 1ch measures the width of the zero glyph.

- Do: max-width: 52ch
- Don't: width: 100%

## Why it works

A 95ch canvas can accommodate a wide table and a narrower reading column. The sample caps the column at 52ch to fit about 65 characters per full line. The exact count depends on the font and the words.

- [USWDS · Measure (line length)](https://designsystem.digital.gov/design-tokens/typesetting/measure/)
- [CSS Values · Font-relative lengths](https://www.w3.org/TR/css-values-4/#ch)

## What breaks

A paragraph that inherits the width of a dashboard can grow very long on a wide display. Hard-coding its minimum width to preserve an ideal measure can create horizontal scrolling at zoom.

## How to apply it

1. Set a maximum inline size on the article text while allowing the column to shrink.
2. Count characters on several full lines of representative material.
3. Review translated text and the largest supported text size.

## Review questions

1. Does the paragraph retain a comfortable measure on a wide display?
2. Can the column shrink to fit a narrow viewport?
3. Do tables and figures have the width their content needs?
