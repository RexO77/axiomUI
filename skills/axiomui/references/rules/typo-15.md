# Stop tightening headline letters before they touch

- ID: typo-15
- Category: Typography & text
- Tags: Headings, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-15

Check the closest letter pairs at the font, weight, and size you’ll use. Negative letter spacing in em units removes more pixels at larger sizes. Leave a visible gap.

- Do: 38px semibold · tracking -0.015em
- Don’t: 38px semibold · tracking -0.05em

## Why it works

Compare the o and g in “together”. At 38px, -0.015em removes 0.57px between letters and -0.05em removes 1.9px. Check the gap again at larger sizes.

- [CSS Text · Letter spacing](https://www.w3.org/TR/css-text-3/#letter-spacing-property)
- [CSS Values and Units · Font-relative lengths](https://www.w3.org/TR/css-values-4/#font-relative-lengths)
- [MDN · Letter spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/letter-spacing)
- [Inter · Dynamic metrics](https://d.rsms.me/inter-website/v3/dynmetrics/)
- [Yu et al. · Letter spacing and reading speed](https://pmc.ncbi.nlm.nih.gov/articles/PMC2729067/)
- [USWDS · Letterspacing tokens](https://designsystem.digital.gov/design-tokens/typesetting/letterspacing/)

## What breaks

Neighboring strokes can nearly join in a large headline, making pairs of letters harder to distinguish during a quick read.

## How to apply it

1. Search heading styles for letter-spacing, letterSpacing, and tracking- classes. Inspect the computed spacing on the rendered headline after the webfont loads.
2. Keep the font, weight, size, and line breaks fixed while trying small tracking adjustments.
3. Check the narrowest gaps between neighboring glyphs in the actual headline and its translations at each display size.

## Before you ship

1. Once the font loads, check the heading at its largest size. With letter spacing applied, can you still see a gap between the closest strokes?
2. Which letter pair comes closest at the smaller heading size?
3. Do the closest pairs in translated headlines still have visible space between them?
