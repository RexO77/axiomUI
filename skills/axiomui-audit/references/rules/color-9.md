# Accessible contrast ratios

- ID: color-9
- Category: Color & depth
- Tags: Contrast, WCAG, Accessibility
- URL: https://axiomui.nischal.fyi/rules/color-9

For WCAG AA, ordinary text needs at least 4.5:1 contrast. Large text qualifies at 3:1. Measure unrounded values against the actual background, including overlays and images behind the text.

- Do: #737373 on #ffffff (4.7:1)
- Don't: #aaaaaa on #ffffff (2.3:1)

## Why it works

On white, #737373 is about 4.74:1. The helper text passes at its regular size. The other sample, #aaaaaa, is about 2.32:1. The labels round these measurements for display. A measured 4.49:1 still fails the 4.5:1 threshold.

- [WCAG 2.2 · Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## What breaks

Assuming that every gray in a palette has a fixed rating misses the second color in the calculation. A pair that passes on white can fail on a tinted input or a lighter part of a photo.

## How to apply it

1. Measure the final foreground and background colors, accounting for transparency.
2. Use the large-text allowance at 18pt regular or 14pt bold and above, or equivalent sizes for CJK fonts.
3. Check helper text, placeholders, and active state labels. Incidental text and logotypes have specific exceptions.

## Review questions

1. What measured pair supports the verdict?
2. If large-text thresholds are used, what size and weight qualify it?
3. Does it pass at the least contrasting background behind the letters?
