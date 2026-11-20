# Size slide exits to the moving element

- ID: motion-15
- Category: Motion & interaction
- Tags: Transform, Drawers, Responsive
- URL: https://axiomui.nischal.fyi/rules/motion-15

For variable-height content, express vertical travel against the element’s transform reference box. Include any gap to the clipping edge in the exit distance.

- Do: translateY(150%)
- Don't: translateY(40px)

## Why it works

translateY(100%) moves an element by the height of its transform reference box. If a toast starts inset from the edge, moving one full height can leave that inset visible. An exit distance can combine a percentage with the known offset, or a surrounding container can clip the travel.

- [CSS Transforms · Transform geometry](https://www.w3.org/TR/css-transforms-1/)

## What breaks

One fixed offset can hide a short message yet leave part of a translated or multi-line message on screen. A visually hidden control may also remain focusable.

## How to apply it

1. Identify the edge or clipping boundary the object must cross.
2. Test short, wrapped and translated content with the actual inset.
3. Remove the dismissed surface from interaction when its state changes.

## Review questions

1. Does the tallest toast clear the boundary?
2. Does the shortest toast also clear its inset?
3. Can focus reach the dismissed content?
