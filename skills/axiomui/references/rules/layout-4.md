# Center the icon by eye

- ID: layout-4
- Category: Layout & spacing
- Tags: Alignment, Icons, Polish
- URL: https://axiomui.nischal.fyi/rules/layout-4

Center the icon box, then check the artwork at its actual size. If it looks off-center, try a small offset. Some icon sets already make this adjustment.

- Do: Play icon shifted 2px right
- Don’t: Play icon centered by its SVG box

## Why it works

The right-facing play triangle carries more weight on the left. Even with its SVG box centered, the triangle can look off-center. Here, a 2px shift to the right balances it.

- [Apple · Create custom symbols](https://developer.apple.com/videos/play/wwdc2021/10250/)
- [Bjango · Formulas for optical adjustments](https://bjango.com/articles/opticaladjustments/)
- [Unity · Iconography](https://unityeditordesignsystem.unity.com/fundamentals/iconography)
- [Adobe Spectrum · Using icons](https://spectrum.adobe.com/foundations/icons-and-illustrations/using-icons)

## What breaks

Applying the same offset to every icon can make a symmetric pause symbol jump sideways when playback starts. A mirrored arrow can even need a correction in the opposite direction.

## How to apply it

1. Compare the glyph with a centered guide at the actual button size.
2. Check the paired state, such as play and pause.
3. Move the icon within the button so the hit area stays put.

## Before you ship

1. Does the artwork appear centered with the guide removed?
2. Does the control stay visually stable as its icon changes?
3. Is the offset specific to this glyph and size?
