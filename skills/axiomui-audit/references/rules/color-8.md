# Design the dark palette by role

- ID: color-8
- Category: Color & depth
- Tags: Dark mode, Surfaces, System
- URL: https://axiomui.nischal.fyi/rules/color-8

Define dark-theme colors for text, surfaces, states, and media. Lighter raised surfaces can distinguish layers when dark shadows are subtle. Tune the accent against its surroundings and preserve meaningful image colors.

- Do: bg neutral-900 / card neutral-800 / brand sat 91% → 55%
- Don't: filter: invert(1) on the whole page

## Why it works

In the storage card, the raised panel needs to separate from its page and the usage bar needs to stay legible on its track. Those are two different color decisions. A page-wide inversion would also change the colors of the image preview.

- [Atlassian · Elevation](https://atlassian.design/foundations/elevation)

## What breaks

A newly themed panel may look convincing on its own while merging into the page behind it. An inverted thumbnail can misrepresent the file a person is choosing.

## How to apply it

1. Compare page, card, and overlay colors as a stack.
2. Measure text, icons, and meaningful graph elements on their own surfaces.
3. Inspect photos and illustrative or monochrome assets separately.

## Review questions

1. Are the surface boundaries clear at each level?
2. Can the usage indicator be read on the dark track?
3. Is the preview still a faithful representation of the file?
