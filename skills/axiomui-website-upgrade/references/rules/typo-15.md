# Tighten display tracking only until letters crowd

- ID: typo-15
- Category: Typography & text
- Tags: Headings, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-15

When tightening a display headline, check the gaps between neighboring glyphs at the shipped font, weight, and size. An em-based adjustment moves the letters farther as the type gets larger. Stop while the closest pairs still have a visible gap.

- Do: 38px semibold · tracking -0.015em
- Don't: 38px semibold · tracking -0.05em

## Why it works

In the two-line headline, tighter tracking compresses the gap between the o and g in together. The same em value moves the letters farther in pixels as the heading gets larger, so check the spacing again when the size changes.

- [USWDS · Letterspacing tokens](https://designsystem.digital.gov/design-tokens/typesetting/letterspacing/)
- [CSS Text · Letter spacing](https://www.w3.org/TR/css-text-3/#letter-spacing-property)

## What breaks

Neighboring strokes can nearly join in a large headline, making pairs of letters harder to distinguish during a quick read.

## How to apply it

1. Search heading styles for letter-spacing, letterSpacing, and tracking- classes. Inspect the computed spacing on the rendered headline after the webfont loads.
2. Keep the font, weight, size, and line breaks fixed while trying small tracking adjustments.
3. Check the narrowest gaps between neighboring glyphs in the actual headline and its translations at each display size.

## Review questions

1. Open the hero at its largest breakpoint, wait for the webfont, and toggle the tracking declaration in DevTools. Is there still a visible gap between the closest strokes with the declaration on?
2. Which letter pair comes closest at the smaller heading size?
3. Do the closest pairs in translated headlines still have visible space between them?
