# Colored shadows

- ID: color-3
- Category: Color & depth
- Tags: Depth, Surfaces
- URL: https://axiomui.nischal.fyi/rules/color-3

Shadows in real life are rarely gray. They pick up the color of the object. Mix your brand color into the shadow.

- Do: shadow-indigo-500/20
- Don't: shadow-black/20

## Why it works

In physical environments, shadows are tinted by ambient bounce light and the color of nearby surfaces, never neutral gray — that’s why shadow-indigo-500/20 under an indigo element reads as believable while shadow-black/20 reads as a flat drop-shadow filter. Mixing brand hue into the shadow simulates that light-source physics instead of faking depth with pure darkness.

## What breaks

A gray shadow under a saturated colored card looks pasted on rather than lifted off the page, making elevated elements feel like flat cutouts instead of physical objects.

## How to apply it

1. Swap shadow-black/20 for a hue-matched shadow like shadow-indigo-500/20.
2. Match the shadow tint to the element’s own dominant color, not a global default.
3. Keep opacity low (10-20%) so the tint reads as ambient, not a color cast.
4. Test shadows against both light and dark surfaces for believability.

## Review questions

1. Does the shadow under a colored element pick up that element’s hue?
2. Would the shadow look wrong if swapped for flat black?
3. Does the elevated element feel like it is floating rather than pasted on?
