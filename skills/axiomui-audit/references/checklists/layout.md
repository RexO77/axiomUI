# Layout & spacing checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Use a shared spacing scale (`layout-1`)

Use a shared scale for padding and gaps. A 4px base is a useful starting point. Hairlines, optical adjustments and sizes set by content can fall between steps.

- Do: 16px padding · 8px gaps · Don’t: 13px padding · 5px gaps
- [ ] Do comparable components use the same spacing step?
- [ ] Does each larger gap represent a different relationship?
- [ ] Would the nearest grid step look better than this off-grid value?
- Reasoning: `references/rules/layout-1.md`

## Limit the width of long paragraphs (`layout-2`)

On wide screens, start with about 65 characters per line for English paragraphs. Count a few full lines. In CSS, 1ch is the width of the font's zero.

- Do: max-width: 52ch · Don’t: width: 100%
- [ ] On a wide screen, do full lines of English text stay near 65 characters?
- [ ] Can the column shrink to fit a narrow viewport?
- [ ] Do tables and figures have the width their content needs?
- Reasoning: `references/rules/layout-2.md`

## Show which items belong together (`layout-3`)

Keep each label closer to its input than to the next field. Connect the label to its input in the markup as well.

- Do: 8px from label to input · 24px between fields · Don’t: 16px from label to input · 16px between fields
- [ ] Which control does each visible label describe?
- [ ] Does the accessible name match the visible label?
- [ ] When an error appears, is the next group still distinct?
- Reasoning: `references/rules/layout-3.md`

## Center the icon by eye (`layout-4`)

Center the icon box, then check the artwork at its actual size. If it looks off-center, try a small offset. Some icon sets already make this adjustment.

- Do: Play icon shifted 2px right · Don’t: Play icon centered by its SVG box
- [ ] Does the artwork appear centered with the guide removed?
- [ ] Does the control stay visually stable as its icon changes?
- [ ] Is the offset specific to this glyph and size?
- Reasoning: `references/rules/layout-4.md`

## Size button padding around the label (`layout-5`)

Give a short text button more padding at the sides than above and below. Check its hit area and leave room for longer labels and larger text.

- Do: 16px at the sides · 8px above and below (2:1) · Don’t: 8px on all sides (1:1)
- [ ] Does the label have enough space beside it?
- [ ] Can the button wrap or grow when text enlarges?
- [ ] How large is the clickable area?
- Reasoning: `references/rules/layout-5.md`

## Align a row icon with the first line of text (`layout-6`)

When an icon introduces a multiline notification, align it to the first line. Centering it in the whole text block moves it down as detail wraps. A single-line action can use centered alignment.

- Do: items-start + 1px top offset · Don’t: items-center on the whole text block
- [ ] Does the bell still sit beside the title after a wrap?
- [ ] Does the artwork look aligned inside its SVG box?
- [ ] Would the bell look centered beside a single line of text?
- Reasoning: `references/rules/layout-6.md`

## Group related details before adding borders (`layout-7`)

Group related details with a heading and spacing. Give an item its own background or border when it has a separate action.

- Do: 2 stat cards on a contrasting background · 0 borders · Don’t: 4 borders around one group of stats
- [ ] Which items does this border group together?
- [ ] Can you tell that both stats belong to “This week”?
- [ ] Can a reader tell which action belongs to each item?
- Reasoning: `references/rules/layout-7.md`

## Reduce outer padding when space is tight (`layout-9`)

Reduce outer padding when a narrow card leaves too little room for content. Keep the smaller gaps inside controls consistent.

- Do: 12px padding on the narrow card · 24px on the wide card · Don’t: 24px padding on both cards
- [ ] Which gutter costs useful reading space?
- [ ] Do interactive targets retain enough size and separation?
- [ ] Does the layout work when a card narrows independently of the viewport?
- Reasoning: `references/rules/layout-9.md`

## Use larger gaps between sections (`layout-10`)

Use a small gap within an item, a larger gap between items, and the largest gap between sections. Repeat that pattern for similar groups.

- Do: 8px / 16px / 32px section break · Don’t: 8px / 16px / 16px section break
- [ ] Where does one item end and the next section begin?
- [ ] Do repeated sections have consistent spacing?
- [ ] Does each section start with a larger gap than the items inside it?
- Reasoning: `references/rules/layout-10.md`

## Check the stacking context before raising z-index (`layout-11`)

Check which stacking context contains each overlay. A menu inside a panel stays below anything stacked above that panel, however high its z-index. The browser's top layer sits above page content.

- Do: z-index: 9999 outside the transform, above Activity · Don’t: z-index: 9999 inside the transform, behind Activity
- [ ] Which stacking context contains Export, and which contains Activity?
- [ ] Does the visual order match focus and pointer behavior?
- [ ] Can you select every Export item with the menu open over Activity?
- Reasoning: `references/rules/layout-11.md`

## Keep scroll and focus targets clear of sticky headers (`layout-12`)

Set scroll padding to clear sticky headers and footers. Follow an in-page link or press Tab and check that the whole target is visible.

- Do: scroll-padding-top: 64px · Don’t: scroll-padding-top: 0px
- [ ] Scroll until the header sticks, open an in-page link to a heading, then Tab forward and Shift+Tab back through the nearby fields. Do the heading and each focus ring clear the header?
- [ ] At 200% zoom, does the inset still match the header’s height?
- [ ] Inside a scrollable panel, are targets clear of both the sticky header and footer?
- Reasoning: `references/rules/layout-12.md`

## Reserve space for media before it loads (`layout-13`)

Give images, videos and embeds a width and height or an aspect ratio before they load. That keeps nearby controls in place.

- Do: aspect-ratio: 2 / 1 before load · Don’t: 0px reserved before load
- [ ] On a page with a loading image, disable the cache, throttle the network and reload. Place the pointer over the button below the image. Does it stay under the pointer as the image loads?
- [ ] Does the placeholder match the final crop at both narrow and wide widths?
- [ ] Does the same space remain reserved when the media request fails?
- Reasoning: `references/rules/layout-13.md`

## Keep the subject in the crop at every ratio (`layout-14`)

When an image fills frames of different proportions, check the crop at each ratio. Set a focal point or supply another crop so the subject stays in frame.

- Do: object-position: right center · latch in both crops · Don’t: object-position: center · latch cropped out of the narrow frame
- [ ] Load the same image in the 2:1 and 3:4 frames. Is the full brass latch visible in both?
- [ ] Resize between the supported widths. Does any intermediate crop cut through the subject?
- [ ] If the subject needs its surroundings for context, is there enough room for both at the narrowest ratio?
- Reasoning: `references/rules/layout-14.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `typo-14` Isolate names in mixed-direction text (`references/checklists/typography.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/checklists/system.md`)
