# The container fallacy

- ID: layout-7
- Category: Layout & spacing
- Tags: Grouping, Surfaces
- URL: https://axiomui.nischal.fyi/rules/layout-7

Don't put every section in a bordered box. Use a background shade or plain space instead: each border is another line competing for attention, and space separates just as well for no ink.

- Do: White card on light gray bg
- Don't: White card with gray border on white bg

## Why it works

Separation between sections needs one contrast channel, not two stacked together. A white card on a light-gray background already reads as a distinct region through figure-ground contrast; adding a border on top is redundant and starts competing with the content it’s meant to frame.

## What breaks

Wrap a white card in a gray border on an already-white page and the border becomes the loudest element on screen, drawing more attention than the content it boxes in, while the page reads as a grid of boxes rather than a layout.

## How to apply it

1. Separate sections with a background-color shift, like a white card on a light-gray page.
2. Drop the border when a background-color difference already exists.
3. Reserve borders for cases with no background contrast available.
4. Test by removing borders temporarily — if sections still read as separate, the border wasn’t needed.

## Review questions

1. Is background-color contrast, rather than a border, doing the work of separating this section?
2. Would sections still look distinct if every border line were removed?
3. Is there a box with a border sitting on top of an already-contrasting background?
