# Derive state fills from one color

- ID: color-10
- Category: Color & depth
- Tags: States, Consistency
- URL: https://axiomui.nischal.fyi/rules/color-10

Derive hover and selection fills from one base color. A translucent fill picks up the background beneath it. Use an opaque fill when its color should stay the same across surfaces.

- Do: Hover blue-500/10 · selected blue-500/15
- Don’t: Hover #e8f0fe · selected #dcebf5 with #1967d2 text

## Why it works

Hover and selection use the same blue at different opacities. Each fill blends with the surface behind it, so the same tint looks different on light and dark. After a brand color change, check that the labels and selected row still stand out.

- [W3C · Simple alpha compositing](https://www.w3.org/TR/compositing-1/#simplealphacompositing)
- [Atlassian · Elevation](https://atlassian.design/foundations/elevation)
- [Adobe Spectrum · Design tokens](https://spectrum.adobe.com/page/design-tokens)
- [IBM Carbon · Selectable tile states](https://www.carbondesignsystem.com/building-blocks/core/components/tile/specifications)

## What breaks

A fixed light blue such as #e8f0fe stays light on a dark sidebar. A translucent fill can go too far the other way and leave the selected row hard to see.

## How to apply it

1. Name hover and selected backgrounds separately.
2. Use the brand color as the base if both fills should change with it.
3. Check each fill against every background where it appears. Keep the selected row recognizable after the pointer leaves, for example with heavier text.

## Before you ship

1. Does the selected row stay distinguishable from a hovered row?
2. Can the label still be read over the composited fill?
3. Which states should change when the brand color changes?
