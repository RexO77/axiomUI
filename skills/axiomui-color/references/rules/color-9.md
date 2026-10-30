# Accessible contrast ratios

- ID: color-9
- Category: Color & depth
- Tags: Contrast, WCAG, Accessibility
- URL: https://axiomui.nischal.fyi/rules/color-9

Text must meet WCAG AA contrast (4.5:1 for body, 3:1 for large text). Don't eyeball it — check it.

- Do: #737373 on #ffffff (4.7:1)
- Don't: #aaaaaa on #ffffff (2.3:1)

## Why it works

WCAG AA sets a measurable floor — 4.5:1 for body text, 3:1 for large text — because below those ratios a meaningful share of users with low vision cannot resolve the letterforms at all. AAA raises the same two numbers to 7:1 and 4.5:1, so an AA pass is the floor and not the ceiling. #aaa on #fff measures about 2.3:1, barely over half the AA minimum: that is a failed measurement, not a debatable style choice.

## What breaks

Body copy set in #aaa on #fff measures about 2.3:1, so readers with even mild vision impairment squint at it or skip it, and any automated audit flags the page against 1.4.3 Contrast (Minimum).

## How to apply it

1. Measure every text and background pairing with a contrast checker; target 4.5:1 or better for body copy.
2. Use the 3:1 allowance only for genuinely large text: 24px/18pt regular, or 18.66px/14pt bold.
3. Replace guessed grays with checked ones: on white you need roughly #767676 or darker to clear 4.5:1.
4. Re-measure whenever a text or background token changes, in both themes.

## Review questions

1. Has every text color on this screen been measured rather than eyeballed?
2. Does body text measure at least 4.5:1 against the background it actually sits on?
3. Is any text leaning on the 3:1 allowance while sitting below 24px regular or 18.66px bold?
