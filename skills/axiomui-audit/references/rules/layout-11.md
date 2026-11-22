# Check the stacking context before raising z-index

- ID: layout-11
- Category: Layout & spacing
- Tags: System, Overlays
- URL: https://axiomui.nischal.fyi/rules/layout-11

Check which stacking context contains each overlay. A menu inside a panel stays below anything stacked above that panel, however high its z-index. The browser's top layer sits above page content.

- Do: z-index: 9999 outside the transform, above Activity
- Don’t: z-index: 9999 inside the transform, behind Activity

## Why it works

The Export menu has z-index 9999 in both examples. Inside the transformed panel, it sits behind Activity because the whole panel does. Outside the panel, the same 9999 places the menu above Activity.

- [CSS · Stacking contexts](https://www.w3.org/TR/CSS2/visuren.html#z-index)
- [CSS Transforms · Transform rendering model](https://www.w3.org/TR/css-transforms-1/#transform-rendering)
- [CSS Positioned Layout · The top layer](https://www.w3.org/TR/css-position-4/#top-layer)
- [Bootstrap · Z-index](https://getbootstrap.com/docs/5.3/layout/z-index/)
- [React · createPortal](https://react.dev/reference/react-dom/createPortal)

## What breaks

Activity covers the right side of the Export menu. In a working menu, clicks in that area would miss the menu items.

## How to apply it

1. List which overlays may appear together and which must take input.
2. Inspect ancestor stacking contexts before changing a layer value.
3. To move a menu outside its panel’s stacking context, render it in a portal outside the panel or open it as a native popover.

## Before you ship

1. Which stacking context contains Export, and which contains Activity?
2. Does the visual order match focus and pointer behavior?
3. Can you select every Export item with the menu open over Activity?
