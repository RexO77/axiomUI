# Use shadows to show depth

- ID: color-12
- Category: Color & depth
- Tags: Depth, Surfaces
- URL: https://axiomui.nischal.fyi/rules/color-12

Give a raised card three shadow layers. A 1px ring marks the edge, a tight shadow sits underneath, and a wider shadow adds depth. A divider can separate flat rows. Keep essential edges visible in forced-colors mode.

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 1px 2px rgb(0 0 0 / 10%), 0 8px 20px -6px rgb(0 0 0 / 18%) · light mode
- Don’t: 1px border on every card · neutral-300 in light mode, neutral-600 in dark mode

## Why it works

Each payment card uses three shadows. A zero-blur ring with a 1px spread draws the edge, a tight shadow sits just below it, and a wider, softer shadow makes the card look raised. Flat payment rows may need only a divider.

- [CSS Backgrounds and Borders · Shadow layers](https://www.w3.org/TR/css-backgrounds-3/#shadow-layers)
- [CSS Color Adjustment · Forced colors](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties)
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation)
- [Josh W. Comeau · Designing beautiful shadows](https://www.joshwcomeau.com/css/designing-shadows/)
- [MDN · Forced colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors)

## What breaks

Forced-colors mode removes box shadows. If a shadow alone marks a field or a selected card, people can still see the content but may miss the field edge or selection.

## How to apply it

1. Decide whether the card should look raised or flat. Give selection its own cue.
2. Use the corresponding elevation token and examine it on each theme surface.
3. Use the neutral elevation token on shared cards, menus and dialogs. Save tinted shadows for one-off promotions where the glow won’t be mistaken for focus or selection.
4. Where the edge matters, add a transparent outline. It remains visible in forced-colors mode when box shadows disappear.

## Before you ship

1. What relationship does elevation communicate here?
2. Does the boundary remain visible when shadows are suppressed?
3. Can you tell a selected card from one that is only raised?
