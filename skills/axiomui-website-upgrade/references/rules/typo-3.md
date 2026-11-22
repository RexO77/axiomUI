# Set line height for paragraphs

- ID: typo-3
- Category: Typography & text
- Tags: Readability, Spacing
- URL: https://axiomui.nischal.fyi/rules/typo-3

For a 16px Latin paragraph, try a unitless line-height of 1.5. Adjust for the typeface, line length, and language.

- Do: 16px / 24px (1.5×)
- Don’t: 16px / 18px (1.125×)

## Why it works

Read the whole paragraph at 16px. Compare how easily you find the next line with a 24px line height and an 18px line height.

- [MDN · Line height](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-height)
- [USWDS · Line height](https://designsystem.digital.gov/design-tokens/typesetting/line-height/)
- [WCAG 2.2 · Visual presentation (1.4.8)](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)
- [WCAG 2.2 · Text spacing overrides and clipping (1.4.12)](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [Material Design · Typography](https://m1.material.io/style/typography.html)

## What breaks

With tight line spacing, descenders can touch accents on the line below. Increasing the spacing can push text outside a fixed-height box. If the box hides overflow, it clips the text.

## How to apply it

1. Set a unitless line-height so it follows changes in text size.
2. Try narrow and wide paragraphs in each script you support. WCAG 1.4.8 (AAA) calls for a way to get at least 1.5 line spacing in blocks of text.
3. Apply the WCAG 1.4.12 text-spacing overrides to catch clipping in fixed-height text containers.

## Before you ship

1. Can you find the next line in a full paragraph without losing your place?
2. Do accents and descenders clear adjacent lines?
3. When spacing increases, is all text still present and usable?
