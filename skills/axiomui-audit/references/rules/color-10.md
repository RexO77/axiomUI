# Give state colors a shared source

- ID: color-10
- Category: Color & depth
- Tags: States, Consistency
- URL: https://axiomui.nischal.fyi/rules/color-10

Map hover and selection colors to named state roles. A translucent fill can adapt to the surface beneath it. An opaque token can be preferable when the state needs a predictable appearance across surfaces.

- Do: Every state = blue-500 / alpha
- Don't: Three hand-picked hexes

## Why it works

The nav sample derives two tints from the same blue. Alpha mixes the source color with whatever is underneath, so an identical value produces different colors over light and dark panels. A change to the brand updates a derived tint but does not guarantee readable text or visible selection.

- [W3C · Simple alpha compositing](https://www.w3.org/TR/compositing-1/#simplealphacompositing)
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation)

## What breaks

An opaque light-blue value reused on a dark sidebar can look like a stray light-theme row. A very faint translucent fill can cause the opposite problem and leave selection hard to distinguish.

## How to apply it

1. Name hover and selected backgrounds separately.
2. Use a shared source where those roles intentionally track the brand.
3. Check the composited result on every supported surface and retain a persistent selected cue.

## Review questions

1. Does the selected row stay distinguishable from a hovered row?
2. Can the label still be read over the composited fill?
3. Which states should change when the brand color changes?
