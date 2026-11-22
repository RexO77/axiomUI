# Give small icons a larger hit area

- ID: sys-3
- Category: System & logic
- Tags: Click targets, Touch, WCAG
- URL: https://axiomui.nischal.fyi/rules/sys-3

Size the hit area separately from the icon. Aim for 44 × 44 CSS pixels on touch. WCAG 2.2 AA requires at least 24 × 24 CSS pixels unless an exception applies.

- Do: 44 × 44px hit area
- Don’t: 16 × 16px hit area

## Why it works

A 16px icon can fit inside a 44px button. Padding inside the button gives a tap more room to land. Margin separates neighboring buttons without enlarging either target.

- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.2 · Target size (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
- [Android Accessibility Help · Touch target size](https://support.google.com/accessibility/android/answer/7101858)
- [Parhi, Karlson & Bederson · One-handed touch target sizes](https://www.cs.umd.edu/hcil/trs/2006-11/2006-11.htm)

## What breaks

A tap just outside Delete can hit Download. Give each button enough room to grow without overlapping its neighbor.

## How to apply it

1. Measure the actual interactive box in CSS pixels.
2. For the WCAG 2.5.8 spacing exception, center a circle 24 CSS pixels across on each undersized target’s bounding box. The circle must not overlap another target or another such circle. Otherwise, check whether another exception applies.
3. Consider 44 × 44 CSS pixels for important touch controls. WCAG 2.5.5 uses that size at AAA with its own exceptions.

## Before you ship

1. Where does the click actually land around the glyph?
2. Does an adjacent action overlap its target?
3. Can someone reliably hit it on the intended input devices?
