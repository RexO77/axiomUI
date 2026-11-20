# Size the hit area for the input

- ID: sys-3
- Category: System & logic
- Tags: Click targets, Touch, WCAG
- URL: https://axiomui.nischal.fyi/rules/sys-3

Size the clickable area independently of the icon. A 44 × 44 CSS px target is a useful touch-friendly choice. WCAG 2.2 AA generally calls for 24 × 24 CSS px or a qualifying exception.

- Do: 44x44px hit area
- Don't: 16x16px hit area

## Why it works

A 16px glyph can sit inside a 44px button and retain its intended visual scale. Enlarging the hit box helps at the moment the pointer arrives. Adding a margin gives separation but leaves the clickable area itself unchanged.

- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.2 · Target size (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)

## What breaks

A small Delete icon next to a clickable file row can turn a near miss into opening the file. Enlarging the target into its neighbor creates a different ambiguity about which action owns the overlap.

## How to apply it

1. Measure the actual interactive box in CSS pixels.
2. For undersized targets, check the spacing or another exception in WCAG 2.5.8 rather than counting any gap as sufficient.
3. Consider 44 × 44 CSS px for important touch controls. WCAG 2.5.5 uses that size at AAA with its own exceptions.

## Review questions

1. Where does the click actually land around the glyph?
2. Does an adjacent action overlap its target?
3. Can someone reliably hit it on the intended input devices?
