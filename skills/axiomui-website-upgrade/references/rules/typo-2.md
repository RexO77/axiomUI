# Check letter spacing on uppercase labels

- ID: typo-2
- Category: Typography & text
- Tags: Labels, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-2

Try a little extra letter spacing on a short uppercase Latin label. Compare +0.025em with the default at the size readers see.

- Do: Uppercase label · +0.025em tracking
- Don’t: Uppercase label · 0em tracking

## Why it works

A little extra spacing separates the letters in ACCOUNT. Some fonts already leave enough room between capitals at their default spacing.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/)
- [USWDS · Letterspacing tokens](https://designsystem.digital.gov/design-tokens/typesetting/letterspacing/)
- [Butterick’s Practical Typography · Letterspacing](https://practicaltypography.com/letterspacing.html)
- [WCAG 2.2 · Text spacing overrides and clipping](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [Microsoft Learn · International design](https://learn.microsoft.com/en-us/globalization/methodology/international-design)

## What breaks

A tracking value copied from a larger heading can push a small label onto a second line. A fixed-width, single-line label can clip when someone increases text spacing.

## How to apply it

1. At the label’s actual size and weight, compare the default spacing with the U.S. Web Design System’s 0.025em for short uppercase labels.
2. Check the longest localized label at the narrowest supported width.
3. Apply the WCAG 1.4.12 text-spacing overrides and check that the label can expand without clipping.

## Before you ship

1. Can you tell neighboring capitals apart at this size?
2. Does the label fit when the reader increases spacing?
3. Does the label’s script use capitals that need extra spacing?
