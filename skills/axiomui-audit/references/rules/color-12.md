# Use elevation when a surface is raised

- ID: color-12
- Category: Color & depth
- Tags: Depth, Surfaces
- URL: https://axiomui.nischal.fyi/rules/color-12

When a surface sits above another, a crisp shadow plus a soft drop can communicate its edge and depth. A flat item may need only a divider. Keep essential boundaries visible in forced colors.

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%)
- Don't: border: 1px neutral-300 on every card

## Why it works

The payment cards use a zero-blur shadow with a 1px spread to draw the edge and a second blurred shadow to suggest lift. The first layer extends outside the box. Either shadows or outlines can suit payment methods, depending on whether the design treats them as raised cards or rows.

- [CSS Backgrounds and Borders · Shadow layers](https://www.w3.org/TR/css-backgrounds-3/#shadow-layers)
- [CSS Color Adjustment · Forced colors](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties)

## What breaks

Forced-color modes suppress box shadows. If a shadow is the sole cue that a field or selected card exists, that distinction can disappear even while its content remains visible.

## How to apply it

1. Decide whether the surface is raised, flat, or selected.
2. Use the corresponding elevation token and examine it on each theme surface.
3. A shadow tinted with the surface’s own hue, such as indigo under an indigo promotion, is optional art direction for a one-off branded surface. Keep reusable cards, menus and dialogs on the neutral elevation token, where a colored glow can read as focus or a special state.
4. Supply a visible system-color border or outline in forced colors when the boundary carries meaning.

## Review questions

1. What relationship does elevation communicate here?
2. Does the boundary remain visible when shadows are suppressed?
3. Can selection be distinguished from ordinary elevation?
