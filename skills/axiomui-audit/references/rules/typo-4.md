# Line height math (headings)

- ID: typo-4
- Category: Typography & text
- Tags: Headings, Spacing
- URL: https://axiomui.nischal.fyi/rules/typo-4

As type gets larger, line-height should get tighter — roughly 1.1x to 1.2x for headings. Leading scales with the font, so a body-text ratio leaves a display heading looking unglued.

- Do: 22px / 24px line-height (1.1x)
- Don't: 22px / 33px line-height (1.5x)

## Why it works

Large type already has generous space between ascenders and descenders, so the extra gap 1.5x line-height adds becomes wasted air rather than reading aid. Tightening to 1.1x-1.2x, 38px for 32px type, keeps multi-word headings visually grouped as one unit instead of drifting into separate floating lines.

## What breaks

A 32px heading set at 48px line-height leaves a visible gap between wrapped lines, making a two-line headline read as two unrelated statements instead of one thought.

## How to apply it

1. Set heading line-height to about 1.1-1.2x size: 32px text gets 38px line-height.
2. Never reuse body line-height ratios (1.5x) on headings.
3. Tighten further as size increases past 40px.
4. Check multi-line headings specifically, since single-line ones hide the problem.

## Review questions

1. Does line-height tighten as heading size increases?
2. Do multi-line headings read as one grouped statement, not separate floating lines?
3. Is the heading’s line-height nearer 1.1x its size than the 1.5x used for body copy?
