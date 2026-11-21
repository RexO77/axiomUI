# Letter spacing on caps

- ID: typo-2
- Category: Typography & text
- Tags: Labels, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-2

For a short uppercase Latin label, compare the font’s default spacing with a small positive adjustment. Judge the result at its displayed size.

- Do: Short caps · +0.025em tracking
- Don't: tracking-normal (0em)

## Why it works

A small amount of extra space gives the uppercase Account label more separation between strokes. A face with generous sidebearings can already have enough room.

- [USWDS · Letterspacing tokens](https://designsystem.digital.gov/design-tokens/typesetting/letterspacing/)
- [WCAG 2.2 · Text spacing overrides and clipping](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

## What breaks

A tracking value copied from a larger heading can push a small label onto a second line. A fixed-width, single-line label can clip when someone increases text spacing.

## How to apply it

1. Compare the font’s default spacing with USWDS’s 0.025em token for short caps at the actual weight and size.
2. Check the longest localized label at the narrowest supported width.
3. Apply the WCAG 1.4.12 text-spacing overrides and check that the label can expand without clipping.

## Review questions

1. Do adjacent forms stay distinct at the rendered size?
2. Does the label fit when the reader increases spacing?
3. Is this treatment appropriate for the script being displayed?
