# Opacity over new colors

- ID: color-10
- Category: Color & depth
- Tags: States, Consistency
- URL: https://axiomui.nischal.fyi/rules/color-10

Build hover, pressed, and tint states from one color plus an alpha value (bg-blue-500/10) instead of hand-picking a hex per state. A token with alpha follows the brand when it changes; a pasted hex does not.

- Do: Every state = blue-500 / alpha
- Don't: Three hand-picked hexes

## Why it works

Deriving hover and tint states from opacity, like bg-blue-500/10, keeps every state mathematically tied to one source color, so the palette scales without designers inventing a new hex like #e8f0fe for each surface. This is a systems argument, not just convenience: opacity states stay correct automatically if the brand color ever changes.

## What breaks

A codebase full of one-off hex tints like #e8f0fe, #eaf1fd, #e6effd for slightly different components will drift out of sync the moment the brand blue updates, leaving stale-looking mismatched tints scattered across the app.

## How to apply it

1. Replace custom tint hexes like #e8f0fe with bg-blue-500/10.
2. Derive hover, pressed, and subtle backgrounds all from opacity of one base color.
3. Never hand-pick a new hex for a state that opacity could produce.
4. Search the codebase for one-off light-tint hex values and consolidate them.

## Review questions

1. Are tint backgrounds built from opacity of the base color, not new hexes?
2. Would updating the brand color automatically update all its tint states?
3. Are there multiple near-identical light-blue hexes scattered in the styles?
