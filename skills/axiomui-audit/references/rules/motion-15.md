# Use percentage transforms

- ID: motion-15
- Category: Motion & interaction
- Tags: Transform, Drawers, Responsive
- URL: https://axiomui.nischal.fyi/rules/motion-15

Translate percentages are based on the element's own size, which makes drawers and toasts adapt to content.

- Do: translateY(150%)
- Don't: translateY(40px)

## Why it works

A percentage translate like translateY(150%) is relative to the element’s own rendered size, so a toast or drawer slides fully offscreen regardless of its content length, while a hardcoded pixel offset assumes one fixed height and breaks the moment content changes.

## What breaks

A drawer using a hardcoded pixel offset leaves a visible sliver on screen the moment its content grows taller than the value the offset assumed, exposing part of the panel that should be hidden.

## How to apply it

1. Use a percentage offset such as translateY(150%) for offscreen positioning, never a pixel count.
2. Replace any hardcoded pixel offset used for hide or show positioning.
3. Re-verify percentage transforms after adding dynamic content that can change element height.
4. Combine with a transform-origin check if the same element also scales.

## Review questions

1. Does the drawer or toast fully leave the screen regardless of its content length?
2. Is positioning driven by a percentage transform rather than a fixed pixel value?
3. Does any hidden panel show a visible sliver when its content changes size?
