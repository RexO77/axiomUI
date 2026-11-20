# Match shadows to their role

- ID: color-3
- Category: Color & depth
- Tags: Depth, Surfaces
- URL: https://axiomui.nischal.fyi/rules/color-3

Choose the shadow tint as part of the surface style. A branded promotion can use an accent-tinted shadow, while a neutral elevation token can serve reusable cards and menus.

- Do: Campaign shadow: indigo tint
- Don't: Same campaign card: black shadow

## Why it works

Both samples use the same offsets, blur, and opacity. Changing just the tint lets you judge whether the promo card belongs to the campaign’s indigo treatment. The choice communicates an art direction. Other surfaces can share one neutral elevation token.

- [CSS Backgrounds and Borders · Shadow layers](https://www.w3.org/TR/css-backgrounds-3/#shadow-layers)
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation)

## What breaks

A literal brand-colored glow on every dropdown and dialog can compete with focus indicators or suggest a special state. A one-off black shadow on a campaign card can also drift from its intended treatment.

## How to apply it

1. Choose a shadow role and compare its appearance on the actual surrounding surface.
2. Hold blur, offset, and opacity constant while judging the tint.
3. Check whether the group boundary remains clear when forced colors remove shadows.

## Review questions

1. Does this shadow represent ordinary elevation or a specific visual treatment?
2. Does it compete with focus or selection cues?
3. Can the content stand on its own when shadows disappear?
