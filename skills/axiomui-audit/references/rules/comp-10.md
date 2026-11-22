# Match the size of related toolbar icons

- ID: comp-10
- Category: Components & actions
- Tags: Icons, Consistency
- URL: https://axiomui.nischal.fyi/rules/comp-10

Start related icons at the same size. Check their visual weight in the toolbar and size the buttons’ hit areas separately.

- Do: All toolbar icons: 20px
- Don’t: 16px, 20px and 24px icons in one toolbar

## Why it works

Two icons on 20px artboards can look different in size or weight. Compare the strokes and the space around each drawing at toolbar size.

- [Apple HIG · Icons](https://developer.apple.com/design/human-interface-guidelines/icons)
- [IBM Carbon · Icon sizing and alignment](https://www.carbondesignsystem.com/building-blocks/foundations/icons/guidelines)
- [Adobe Spectrum · Using icons](https://spectrum.adobe.com/foundations/icons-and-illustrations/using-icons)
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## What breaks

At 24px, Delete draws more attention than the 16px Archive icon. Check the button separately to see how much of the toolbar responds to a click.

## How to apply it

1. Start icons in the same toolbar group on the same size artboard.
2. Review thin, dense and asymmetric glyphs beside each other at their rendered size.
3. Adjust drawings that look too heavy or light. Keep button hit areas and focus indicators consistent.

## Before you ship

1. Which actions belong to the same group?
2. Does one glyph dominate without a reason?
3. Can the button remain easy to hit even when the drawing is small?
