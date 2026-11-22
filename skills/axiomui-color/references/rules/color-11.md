# Outline images that blend into the page

- ID: color-11
- Category: Color & depth
- Tags: Images, Depth, Dark mode
- URL: https://axiomui.nischal.fyi/rules/color-11

If a thumbnail blends into the page, try a 1px inset outline. The example uses black at 10% opacity on white and white at 10% on dark. Skip the outline when the image already has a clear edge.

- Do: outline-black/10 dark:outline-white/10
- Don’t: outline-slate-900/10 in both themes

## Why it works

The pale thumbnail blends into white, and the dark thumbnail blends into charcoal. A black outline at 10% opacity defines the pale edge. White at 10% defines the dark one. Keep this frame distinct from focus or selection.

- [Adobe Spectrum · Thumbnail](https://spectrum.adobe.com/web/rsp/components/thumbnail)
- [W3C · Simple alpha compositing](https://www.w3.org/TR/compositing-1/#simplealphacompositing)
- [CSS Basic User Interface · Outline offset](https://www.w3.org/TR/css-ui-3/#outline-offset)
- [WCAG 2.2 · Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [PIE Design System · Thumbnail](https://pie.design/components/thumbnail/web/)

## What breaks

A dark outline can disappear against a dark photo. A heavy border around every thumbnail can hide detail at the edge or make every image look selected.

## How to apply it

1. Test actual images with pale, dark, and transparent edges.
2. Set outline-offset to -1px to draw the 1px outline inside the thumbnail.
3. Give keyboard focus and selection their own visible cues.

## Before you ship

1. Is the edge difficult to locate in this crop?
2. Does the outline draw more attention than the thumbnail?
3. Can people distinguish the frame from focus or selection?
