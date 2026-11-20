# Define stacking order within each context

- ID: layout-11
- Category: Layout & spacing
- Tags: System, Overlays
- URL: https://axiomui.nischal.fyi/rules/layout-11

Give overlay roles an intentional order and identify the stacking context that contains them. A large z-index on a child cannot lift it above a higher sibling context or the browser’s top layer.

- Do: z-dropdown: 100, z-modal: 300
- Don't: z-index: 9999

## Why it works

The two diagrams put the modal above the dropdown. Both sets of numbers achieve that ordering in the same context. Role names explain the decision to the next author. Native dialogs and popovers in the top layer follow a different stacking mechanism.

- [CSS · Stacking contexts](https://www.w3.org/TR/CSS2/visuren.html#z-index)
- [CSS Positioned Layout · The top layer](https://www.w3.org/TR/css-position-4/#top-layer)

## What breaks

A dropdown inside a transformed ancestor can stay under a sticky header even with z-index 9999. Raising the number conceals the actual question of where the dropdown belongs in the document.

## How to apply it

1. List which overlays may appear together and which must take input.
2. Inspect ancestor stacking contexts before changing a layer value.
3. Use a suitable portal or a native top-layer primitive when the overlay must escape its context.

## Review questions

1. Which context owns each competing element?
2. Does the visual order match focus and pointer behavior?
3. Can feedback for an action still be seen inside the active dialog?
