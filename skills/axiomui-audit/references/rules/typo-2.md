# Letter spacing on caps

- ID: typo-2
- Category: Typography & text
- Tags: Labels, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-2

If text is uppercase, always add letter-spacing (tracking) to improve legibility. Uppercase letters have no natural rhythm.

- Do: tracking-wider (0.05em)
- Don't: tracking-normal (0em)

## Why it works

All-caps labels can look crowded at default spacing, especially in small, condensed or bold text. Modest extra tracking, around 0.05em, separates neighboring strokes. Use it as a starting point and check the actual font: the goal is a label whose letters remain distinct, rather than one fixed spacing value for every typeface.

## What breaks

Uppercase labels at default tracking look cramped and letters visually merge, especially in condensed or bold weights. Small uppercase text like tab labels or badges becomes noticeably harder to parse at a glance.

## How to apply it

1. Start with tracking-wider (0.05em) for uppercase labels, then adjust for the actual font, size, and weight.
2. Check the rendered label for crowded strokes rather than applying one tracking value to every typeface.
3. Keep labels with the same font, size, and weight consistent; review distinct treatments separately.
4. Check condensed and bold uppercase styles first, since they collide most.

## Review questions

1. Was the starting tracking value checked with the actual font, size, and weight?
2. Do uppercase labels avoid feeling cramped or merged together?
3. Do uppercase labels using the same type treatment use consistent tracking?
