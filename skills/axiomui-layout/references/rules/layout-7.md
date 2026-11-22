# Group related details before adding borders

- ID: layout-7
- Category: Layout & spacing
- Tags: Grouping, Surfaces
- URL: https://axiomui.nischal.fyi/rules/layout-7

Group related details with a heading and spacing. Give an item its own background or border when it has a separate action.

- Do: 2 stat cards on a contrasting background · 0 borders
- Don’t: 4 borders around one group of stats

## Why it works

Four borders give the panel, the “This week” heading and the two stats equal weight. A contrasting background separates each stat, and the heading groups them. Borders can help when each item has its own action.

- [USWDS · Cards](https://designsystem.digital.gov/components/card/)
- [Cognitive Psychology · Common region](https://e-edu.nbu.bg/pluginfile.php/951829/mod_resource/content/1/Stephen-Palmer%20-%20Common%20region%20-%20A%20new%20principle%20of%20perceptual%20grouping%201992.pdf)
- [USWDS · Typography](https://designsystem.digital.gov/components/typography/)
- [Material Design · Cards](https://m1.material.io/components/cards.html)

## What breaks

Removing all outlines can hide the bounds of separate interactive items. Adding a frame to every label makes it harder to see which pieces share a single action.

## How to apply it

1. Identify whether a group is an independent item, a section, or a control.
2. Try a heading and a change in spacing before adding an inner frame.
3. Keep the border if it shows which item an action belongs to.

## Before you ship

1. Which items does this border group together?
2. Can you tell that both stats belong to “This week”?
3. Can a reader tell which action belongs to each item?
