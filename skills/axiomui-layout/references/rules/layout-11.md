# Z-index scale

- ID: layout-11
- Category: Layout & spacing
- Tags: System, Overlays
- URL: https://axiomui.nischal.fyi/rules/layout-11

Define a z-index scale (base 0, dropdown 100, sticky 200, modal 300, toast 400) and only use its steps. Arbitrary values turn every new overlay into a bidding war that ends at 9999.

- Do: z-dropdown: 100, z-modal: 300
- Don't: z-index: 9999

## Why it works

Z-index only resolves relative to other values within the same stacking context, so arbitrary numbers like 9999 guarantee nothing — a new stacking context can bury it under a lower value elsewhere. A defined scale, base 0, dropdown 100, sticky 200, modal 300, toast 400, keeps stacking order legible and stops ad hoc escalation.

## What breaks

Once one component ships with z-index: 9999 to win, the next fix ships 99999 to beat it, and eventually a toast renders behind a modal because nobody knows which arbitrary number currently wins.

## How to apply it

1. Assign layers from the fixed scale only, z-dropdown 100, z-modal 300, and so on.
2. Ban arbitrary values like z-index: 9999 anywhere in the codebase.
3. Centralize the scale as CSS variables or design tokens so every component references the same source.
4. Add new layers between existing steps, like 150, rather than inventing values above the top of the scale.

## Review questions

1. Does every stacked element, dropdown, sticky header, modal, toast, use a value from the defined scale?
2. Is there any arbitrary z-index value like 9999 anywhere in the styles?
3. Do toasts and modals stack in the correct visual order when triggered together?
