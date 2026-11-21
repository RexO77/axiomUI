# Layout & spacing checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Use a shared spacing scale (`layout-1`)

Choose named spacing steps for repeated relationships. A 4px base is useful for padding and gaps. Hairlines, optical offsets, and content-driven dimensions can use other values.

- Do: 4px, 8px, 16px, 24px, 32px, 48px · Don't: 13px, 5px
- [ ] Do comparable components use the same spacing step?
- [ ] Does each larger gap represent a different relationship?
- [ ] Would rounding this exception improve the result?
- Reasoning: `references/rules/layout-1.md`

## Set a measure for long-form text (`layout-2`)

Limit the width of sustained prose on wide screens. Around 65 characters per line is a useful starting point for English paragraphs. Check the actual text because 1ch measures the width of the zero glyph.

- Do: max-width: 52ch · Don't: width: 100%
- [ ] Does the paragraph retain a comfortable measure on a wide display?
- [ ] Can the column shrink to fit a narrow viewport?
- [ ] Do tables and figures have the width their content needs?
- Reasoning: `references/rules/layout-2.md`

## Show which items belong together (`layout-3`)

Use a smaller gap within a label–field pair and a larger gap between fields. Keep each label programmatically associated with its control.

- Do: Label (gap-2) Input (gap-6) Next Label · Don't: Label (gap-4) Input (gap-4) Next Label
- [ ] Which control does each visible label describe?
- [ ] Does the accessible name match the visible label?
- [ ] When an error appears, is the next group still distinct?
- Reasoning: `references/rules/layout-3.md`

## Optically center asymmetric glyphs (`layout-4`)

Center the icon box first. If an asymmetric glyph still looks displaced inside its control, compare a small offset at the intended size. Some icon sets already provide optical compensation.

- Do: Play icon nudged +2px right · Don't: Play icon on the geometric center
- [ ] Does the artwork appear centered with the guide removed?
- [ ] Does the control stay visually stable as its icon changes?
- [ ] Is the offset specific to this glyph and size?
- Reasoning: `references/rules/layout-4.md`

## Size button padding around the label (`layout-5`)

For a short text button, try more inline padding than block padding. Set the hit area, line height, and space for long labels separately from that visual proportion.

- Do: py-2 px-4 (ratio 2:1) · Don't: py-2 px-2 (ratio 1:1)
- [ ] Does the label have enough space beside it?
- [ ] Can the button wrap or grow when text enlarges?
- [ ] How large is the area that actually responds?
- Reasoning: `references/rules/layout-5.md`

## Anchor a row icon to the text it describes (`layout-6`)

When an icon introduces a multiline notification, align it to the first line. Centering it in the whole text block moves it down as detail wraps. A single-line action can use centered alignment.

- Do: items-start + 1px top offset · Don't: items-center on the whole text block
- [ ] Does the bell still sit beside the title after a wrap?
- [ ] Does the artwork look aligned inside its SVG box?
- [ ] Would a single-line version need a different treatment?
- Reasoning: `references/rules/layout-6.md`

## Choose a boundary that explains the group (`layout-7`)

Use headings and space for related content that reads in sequence. A card surface or border can help when an item stands on its own or takes a distinct action.

- Do: White card on light gray bg · Don't: White card with gray border on white bg
- [ ] What does this edge tell the reader?
- [ ] Can the items be reordered independently?
- [ ] Can a reader tell which action belongs to each item?
- Reasoning: `references/rules/layout-7.md`

## Adapt outer spacing to available width (`layout-9`)

Reconsider large page and card insets when a layout narrows. Preserve the spacing that holds small controls and related text together. Change a token when the content shows why.

- Do: p-3 sm / p-6 lg · Don't: p-6 sm / p-6 lg
- [ ] Which gutter costs useful reading space?
- [ ] Do interactive targets retain enough size and separation?
- [ ] Does the layout work when a card narrows independently of the viewport?
- Reasoning: `references/rules/layout-9.md`

## Use spacing to express vertical hierarchy (`layout-10`)

Give lines within one item, neighboring items, and major sections different spacing roles. Reuse the same role whenever that relationship recurs.

- Do: 8px / 16px / 32px section break · Don't: 8px / 16px / 16px section break
- [ ] Where does one item end and the next section begin?
- [ ] Do repeated sections have consistent spacing?
- [ ] Does a larger break correspond to a meaningful boundary?
- Reasoning: `references/rules/layout-10.md`

## Define stacking order within each context (`layout-11`)

Give overlay roles an intentional order and identify the stacking context that contains them. A large z-index on a child cannot lift it above a higher sibling context or the browser’s top layer.

- Do: z-index: 9999 outside the transform, above Activity · Don't: z-index: 9999 inside the transform, behind Activity
- [ ] Which context owns each competing element?
- [ ] Does the visual order match focus and pointer behavior?
- [ ] Can you select every Export item with the menu open over Activity?
- Reasoning: `references/rules/layout-11.md`

## Keep scroll and focus targets clear of sticky headers (`layout-12`)

Account for the height of sticky headers and footers in the scroll container. After an anchor jump or keyboard focus, the entire target should be visible.

- Do: scroll-padding-top: 64px · Don't: scroll-padding-top: 0px
- [ ] Scroll until the header sticks, open an in-page link to a heading, then Tab forward and Shift+Tab back through the nearby fields. Do the heading and each focus ring clear the header?
- [ ] At 200% zoom, does the inset still match the header’s height?
- [ ] Inside a scrollable panel, are targets clear of both the sticky header and footer?
- Reasoning: `references/rules/layout-12.md`

## Reserve space for media before it loads (`layout-13`)

Give images, videos, and embeds dimensions or an aspect ratio before they load. Reserve that space on the first render so nearby controls stay where people expect them.

- Do: aspect-ratio: 2 / 1 before load · Don't: 0px reserved before load
- [ ] Disable cache, throttle the network, and reload. Keep the pointer over View details while the image starts loading and finishes rendering. Does the button stay under the pointer?
- [ ] Does the placeholder match the final crop at both narrow and wide widths?
- [ ] Does the same space remain reserved when the media request fails?
- Reasoning: `references/rules/layout-13.md`

## Keep the subject in the crop at every ratio (`layout-14`)

When an image fills frames of different proportions, check the crop at each ratio. Set a focal point or supply another crop so the subject stays in frame.

- Do: object-position: right center · latch in both crops · Don't: object-position: center · latch cropped out
- [ ] Load the same image in the 2:1 and 3:4 frames. Is the full brass latch visible in both?
- [ ] Resize between the supported widths. Does any intermediate crop cut through the subject?
- [ ] If the subject needs its surroundings for context, is there enough room for both at the narrowest ratio?
- Reasoning: `references/rules/layout-14.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `typo-14` Keep names and counts together across scripts (`references/checklists/typography.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/checklists/system.md`)
