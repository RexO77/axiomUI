# Letter spacing on caps

- ID: typo-2
- Category: Typography & text
- Tags: Labels, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-2

For a short uppercase Latin label, compare the font’s default spacing with a small positive adjustment. Judge the result at its displayed size.

- Do: tracking-wider (0.05em)
- Don't: tracking-normal (0em)

## Why it works

The difference between 0 and 0.05em accumulates across the letters of a long navigation label. Extra space can separate crowded strokes. A face with generous sidebearings can already have enough room.

- [USWDS · Typesetting guidance](https://designsystem.digital.gov/components/typography/)
- [WCAG 2.2 · Text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

## What breaks

A tracking value copied from a larger heading can push a small label onto a second line. Applying the same treatment across scripts can interfere with expected spacing and joining.

## How to apply it

1. Compare the same label at its actual weight and size with 0 and 0.05em tracking.
2. Check the longest localized label at the narrowest supported width.
3. Allow reader spacing overrides to expand the label without clipping it.

## Review questions

1. Do adjacent forms stay distinct at the rendered size?
2. Does the label fit when the reader increases spacing?
3. Is this treatment appropriate for the script being displayed?
