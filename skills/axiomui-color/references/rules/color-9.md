# Check text contrast

- ID: color-9
- Category: Color & depth
- Tags: Contrast, WCAG, Accessibility
- URL: https://axiomui.nischal.fyi/rules/color-9

WCAG AA requires at least 4.5:1 contrast for ordinary text and 3:1 for large text. Measure against the background behind the letters, including images and overlays. Use the unrounded ratio.

- Do: #737373 on #ffffff (4.7:1)
- Don’t: #aaaaaa on #ffffff (2.3:1)

## Why it works

On white, #737373 measures about 4.74:1 and passes for the 10px helper text. The lighter #aaaaaa measures about 2.32:1 and fails. The labels round for display. A measured 4.49:1 still falls below 4.5:1.

- [WCAG 2.2 · Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C WAI · Text contrast technique G18](https://www.w3.org/WAI/WCAG22/Techniques/general/G18)
- [USWDS · Using color](https://designsystem.digital.gov/design-tokens/color/overview/)

## What breaks

Contrast depends on both colors. Gray text that passes on white can fail on a tinted field or where a photo is close to the same gray.

## How to apply it

1. Measure the final foreground and background colors, accounting for transparency.
2. The 3:1 threshold starts at 18pt (24px) for regular text or 14pt (about 18.7px) for bold text. Use the equivalent sizes for CJK fonts.
3. Check helper text, placeholders and labels on enabled controls. Exceptions include text on disabled controls, purely decorative text and text in logos.

## Before you ship

1. Which text and background colors did you measure, and what was their contrast ratio?
2. If you used the large-text threshold, do the font size and weight qualify?
3. Where the text blends most into the background, does the contrast still pass?
