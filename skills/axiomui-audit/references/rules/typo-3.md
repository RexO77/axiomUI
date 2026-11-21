# Set body leading for sustained reading

- ID: typo-3
- Category: Typography & text
- Tags: Readability, Spacing
- URL: https://axiomui.nischal.fyi/rules/typo-3

For a paragraph of 16px Latin text, try a unitless line-height of 1.5. Adjust it with the typeface, line length, and language in view.

- Do: Size: 16px / Line-height: 24px
- Don't: Size: 16px / Line-height: 18px

## Why it works

A paragraph asks the reader to move repeatedly from the end of one line to the start of the next. In the sample, 24px leading gives a 16px face more separation than 18px. Compare a full paragraph because single-line labels reveal little about that return.

- [WCAG 2.2 · Visual presentation (1.4.8)](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)
- [WCAG 2.2 · Text spacing overrides and clipping (1.4.12)](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [USWDS · Line height](https://designsystem.digital.gov/design-tokens/typesetting/line-height/)

## What breaks

Tight leading can bring tall marks and descenders on neighboring lines together. Fixing the text container’s height then clips content when a reader increases line spacing.

## How to apply it

1. Set a unitless line-height so it follows changes in text size.
2. Try short and wide measures in the scripts you ship. WCAG 1.4.8 (AAA) calls for a way to get at least 1.5 line spacing in blocks of text.
3. Apply the WCAG 1.4.12 text-spacing overrides to catch clipping in fixed-height text containers.

## Review questions

1. Can you follow the next line throughout a realistic paragraph?
2. Do accents and descenders clear adjacent lines?
3. When spacing increases, is all text still present and usable?
