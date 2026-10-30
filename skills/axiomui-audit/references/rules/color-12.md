# Shadows can replace borders

- ID: color-12
- Category: Color & depth
- Tags: Depth, Surfaces
- URL: https://axiomui.nischal.fyi/rules/color-12

For cards, buttons, and raised containers, layered transparent shadows define an edge more cleanly than a border. A border draws one hard line at full strength; a shadow describes the same edge with a falloff, so the card lifts instead of being outlined.

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%)
- Don't: border: 1px neutral-300 on every card

## Why it works

A layered shadow stack like 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%) supplies both edge definition and perceived elevation in one property, mimicking how ambient occlusion softens real-world edges — a hard border can only ever supply the edge, not the lift. This lets a card look raised without the visual weight of a stroke competing with its content.

## What breaks

Stacking a heavy 1px border on every card in a dense list, like a table of nested panels, makes the layout look like a spreadsheet of boxes with no sense of which surface actually sits above another.

## How to apply it

1. Replace heavy card borders with a layered shadow like 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%).
2. Use the 1px inset layer for edge crispness and the blurred layer for elevation.
3. Drop the hard border entirely once the shadow stack reads clearly.
4. Reserve visible borders for cases needing a hard boundary, like selected states.

## Review questions

1. Do raised cards use layered shadows instead of a hard border?
2. Can you tell which surface is elevated without a visible stroke?
3. Does the card edge look soft and lifted rather than sharply outlined?
