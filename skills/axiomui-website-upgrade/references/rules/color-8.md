# Design the dark palette by role

- ID: color-8
- Category: Color & depth
- Tags: Dark mode, Surfaces, System
- URL: https://axiomui.nischal.fyi/rules/color-8

Choose dark-theme colors for each role. A lighter card stands out against a dark page. Adjust the accent for its background and keep photos in their original colors.

- Do: Page neutral-900 · card neutral-800 · blue saturation 91% → 55%
- Don’t: filter: invert(1) on the whole page

## Why it works

The lighter storage card stands out against the dark page. A muted blue keeps the usage bar visible on its track. Inverting the whole page also turns the file thumbnail into a negative.

- [Apple HIG · Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation)
- [web.dev · Prefers-color-scheme](https://web.dev/articles/prefers-color-scheme)
- [Filter Effects · Invert](https://www.w3.org/TR/filter-effects-1/#funcdef-filter-invert)
- [IBM Carbon · Color themes](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview)

## What breaks

A newly themed panel may look convincing on its own while merging into the page behind it. An inverted thumbnail can misrepresent the file a person is choosing.

## How to apply it

1. Compare page, card, and overlay colors as a stack.
2. Check the contrast of text, icons and chart marks against their backgrounds.
3. Inspect photos and illustrative or monochrome assets separately.

## Before you ship

1. Are the surface boundaries clear at each level?
2. Can you see the usage bar against the dark track?
3. Does the thumbnail preserve the colors of the original file?
