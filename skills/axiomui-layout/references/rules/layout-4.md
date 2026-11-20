# Optically center asymmetric glyphs

- ID: layout-4
- Category: Layout & spacing
- Tags: Alignment, Icons, Polish
- URL: https://axiomui.nischal.fyi/rules/layout-4

Center the icon box first. If an asymmetric glyph still looks displaced inside its control, compare a small offset at the intended size. Some icon sets already provide optical compensation.

- Do: Play icon nudged +2px right
- Don't: Play icon on the geometric center

## Why it works

In the play button, the visible mass of a right-facing glyph can sit toward the vertical edge of the triangle. Comparing the centered glyph with a 2px nudge exposes the difference between the SVG box and the marks inside it. Padding built into the icon artwork affects the result.

- [Apple · Create custom symbols](https://developer.apple.com/videos/play/wwdc2021/10250/)

## What breaks

Applying the same offset to every icon can make a symmetric pause symbol jump sideways when playback starts. A mirrored arrow can even need a correction in the opposite direction.

## How to apply it

1. Compare the glyph with a centered guide at the actual button size.
2. Check the paired state, such as play and pause.
3. Move the artwork inside the control and preserve the hit area.

## Review questions

1. Does the artwork appear centered with the guide removed?
2. Does the control stay visually stable as its icon changes?
3. Is the offset specific to this glyph and size?
