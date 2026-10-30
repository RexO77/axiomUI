# Dark mode isn't inverted

- ID: color-8
- Category: Color & depth
- Tags: Dark mode, Surfaces, System
- URL: https://axiomui.nischal.fyi/rules/color-8

Dark mode is not an inverted light theme. Reduce surface contrast, desaturate brand colors, and flip the elevation model so a lighter surface reads as a higher one.

- Do: bg neutral-900 / card neutral-800 / brand sat 91% → 55%
- Don't: filter: invert(1) on the whole page

## Why it works

Dark mode is not photographic negative — it requires flipping the elevation model so lighter surfaces read as closer (gray-900 base, gray-800 card, lighter still for modals), while brand colors need desaturating because fully saturated hues vibrate painfully against dark backgrounds due to simultaneous contrast. Literally inverting filters ignores both of these perceptual shifts.

## What breaks

Running filter: invert(1) on a page turns photos into film negatives and makes saturated brand blue glow like a highlighter, making the whole UI look broken rather than themed.

## How to apply it

1. Build a real dark palette: gray-900 background, gray-800 card surfaces.
2. Desaturate brand colors specifically for dark mode, do not reuse light-mode hex values.
3. Make elevated surfaces lighter than their base, not darker as in light mode.
4. Never apply filter: invert(1) to the page as a shortcut.

## Review questions

1. Do elevated cards appear lighter than the page background in dark mode?
2. Are brand colors visibly desaturated compared to the light theme?
3. Do images and photos render normally, not as inverted negatives?
