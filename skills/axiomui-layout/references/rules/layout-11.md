# Define stacking order within each context

- ID: layout-11
- Category: Layout & spacing
- Tags: System, Overlays
- URL: https://axiomui.nischal.fyi/rules/layout-11

Give overlay roles an intentional order and identify the stacking context that contains them. A large z-index on a child cannot lift it above a higher sibling context or the browser’s top layer.

- Do: z-index: 9999 outside the transform, above Activity
- Don't: z-index: 9999 inside the transform, behind Activity

## Why it works

The Export menu has z-index 9999 in both panes. Inside the transformed panel, that number only orders it within the panel, so Activity can cover it. Moving the menu outside the panel lets it stack directly against Activity.

- [CSS · Stacking contexts](https://www.w3.org/TR/CSS2/visuren.html#z-index)
- [CSS Transforms · Transform rendering model](https://www.w3.org/TR/css-transforms-1/#transform-rendering)
- [CSS Positioned Layout · The top layer](https://www.w3.org/TR/css-position-4/#top-layer)

## What breaks

Activity can cover part of the Export menu and take pointer input where a menu item should be clickable.

## How to apply it

1. List which overlays may appear together and which must take input.
2. Inspect ancestor stacking contexts before changing a layer value.
3. Use a suitable portal or a native top-layer primitive when the overlay must escape its context.

## Review questions

1. Which context owns each competing element?
2. Does the visual order match focus and pointer behavior?
3. Can you select every Export item with the menu open over Activity?
