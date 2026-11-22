# Layout & spacing

Compact Do/Don’t for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Use a shared spacing scale (`layout-1`)

Use a shared scale for padding and gaps. A 4px base is a useful starting point. Hairlines, optical adjustments and sizes set by content can fall between steps.

- Do: 16px padding · 8px gaps
- Don’t: 13px padding · 5px gaps
- Reasoning: `references/rules/layout-1.md` · https://axiomui.nischal.fyi/rules/layout-1

## Limit the width of long paragraphs (`layout-2`)

On wide screens, start with about 65 characters per line for English paragraphs. Count a few full lines. In CSS, 1ch is the width of the font's zero.

- Do: max-width: 52ch
- Don’t: width: 100%
- Reasoning: `references/rules/layout-2.md` · https://axiomui.nischal.fyi/rules/layout-2

## Show which items belong together (`layout-3`)

Keep each label closer to its input than to the next field. Connect the label to its input in the markup as well.

- Do: 8px from label to input · 24px between fields
- Don’t: 16px from label to input · 16px between fields
- Reasoning: `references/rules/layout-3.md` · https://axiomui.nischal.fyi/rules/layout-3

## Center the icon by eye (`layout-4`)

Center the icon box, then check the artwork at its actual size. If it looks off-center, try a small offset. Some icon sets already make this adjustment.

- Do: Play icon shifted 2px right
- Don’t: Play icon centered by its SVG box
- Reasoning: `references/rules/layout-4.md` · https://axiomui.nischal.fyi/rules/layout-4

## Size button padding around the label (`layout-5`)

Give a short text button more padding at the sides than above and below. Check its hit area and leave room for longer labels and larger text.

- Do: 16px at the sides · 8px above and below (2:1)
- Don’t: 8px on all sides (1:1)
- Reasoning: `references/rules/layout-5.md` · https://axiomui.nischal.fyi/rules/layout-5

## Align a row icon with the first line of text (`layout-6`)

When an icon introduces a multiline notification, align it to the first line. Centering it in the whole text block moves it down as detail wraps. A single-line action can use centered alignment.

- Do: items-start + 1px top offset
- Don’t: items-center on the whole text block
- Reasoning: `references/rules/layout-6.md` · https://axiomui.nischal.fyi/rules/layout-6

## Group related details before adding borders (`layout-7`)

Group related details with a heading and spacing. Give an item its own background or border when it has a separate action.

- Do: 2 stat cards on a contrasting background · 0 borders
- Don’t: 4 borders around one group of stats
- Reasoning: `references/rules/layout-7.md` · https://axiomui.nischal.fyi/rules/layout-7

## Reduce outer padding when space is tight (`layout-9`)

Reduce outer padding when a narrow card leaves too little room for content. Keep the smaller gaps inside controls consistent.

- Do: 12px padding on the narrow card · 24px on the wide card
- Don’t: 24px padding on both cards
- Reasoning: `references/rules/layout-9.md` · https://axiomui.nischal.fyi/rules/layout-9

## Use larger gaps between sections (`layout-10`)

Use a small gap within an item, a larger gap between items, and the largest gap between sections. Repeat that pattern for similar groups.

- Do: 8px / 16px / 32px section break
- Don’t: 8px / 16px / 16px section break
- Reasoning: `references/rules/layout-10.md` · https://axiomui.nischal.fyi/rules/layout-10

## Check the stacking context before raising z-index (`layout-11`)

Check which stacking context contains each overlay. A menu inside a panel stays below anything stacked above that panel, however high its z-index. The browser's top layer sits above page content.

- Do: z-index: 9999 outside the transform, above Activity
- Don’t: z-index: 9999 inside the transform, behind Activity
- Reasoning: `references/rules/layout-11.md` · https://axiomui.nischal.fyi/rules/layout-11

## Keep scroll and focus targets clear of sticky headers (`layout-12`)

Set scroll padding to clear sticky headers and footers. Follow an in-page link or press Tab and check that the whole target is visible.

- Do: scroll-padding-top: 64px
- Don’t: scroll-padding-top: 0px
- Reasoning: `references/rules/layout-12.md` · https://axiomui.nischal.fyi/rules/layout-12

## Reserve space for media before it loads (`layout-13`)

Give images, videos and embeds a width and height or an aspect ratio before they load. That keeps nearby controls in place.

- Do: aspect-ratio: 2 / 1 before load
- Don’t: 0px reserved before load
- Reasoning: `references/rules/layout-13.md` · https://axiomui.nischal.fyi/rules/layout-13

## Keep the subject in the crop at every ratio (`layout-14`)

When an image fills frames of different proportions, check the crop at each ratio. Set a focal point or supply another crop so the subject stays in frame.

- Do: object-position: right center · latch in both crops
- Don’t: object-position: center · latch cropped out of the narrow frame
- Reasoning: `references/rules/layout-14.md` · https://axiomui.nischal.fyi/rules/layout-14

## Related rules in other domains

- `typo-14` Isolate names in mixed-direction text (`references/typography.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/system.md`)
