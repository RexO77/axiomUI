# Layout & spacing

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Use a shared spacing scale (`layout-1`)

Choose named spacing steps for repeated relationships. A 4px base is useful for padding and gaps. Hairlines, optical offsets, and content-driven dimensions can use other values.

- Do: 4px, 8px, 16px, 24px, 32px, 48px
- Don't: 13px, 5px
- Reasoning: `references/rules/layout-1.md` · https://axiomui.nischal.fyi/rules/layout-1

## Set a measure for long-form text (`layout-2`)

Limit the width of sustained prose on wide screens. Around 65 characters per line is a useful starting point for English paragraphs. Check the actual text because 1ch measures the width of the zero glyph.

- Do: max-width: 52ch
- Don't: width: 100%
- Reasoning: `references/rules/layout-2.md` · https://axiomui.nischal.fyi/rules/layout-2

## Show which items belong together (`layout-3`)

Use a smaller gap within a label–field pair and a larger gap between fields. Keep each label programmatically associated with its control.

- Do: Label (gap-2) Input (gap-6) Next Label
- Don't: Label (gap-4) Input (gap-4) Next Label
- Reasoning: `references/rules/layout-3.md` · https://axiomui.nischal.fyi/rules/layout-3

## Optically center asymmetric glyphs (`layout-4`)

Center the icon box first. If an asymmetric glyph still looks displaced inside its control, compare a small offset at the intended size. Some icon sets already provide optical compensation.

- Do: Play icon nudged +2px right
- Don't: Play icon on the geometric center
- Reasoning: `references/rules/layout-4.md` · https://axiomui.nischal.fyi/rules/layout-4

## Size button padding around the label (`layout-5`)

For a short text button, try more inline padding than block padding. Set the hit area, line height, and space for long labels separately from that visual proportion.

- Do: py-2 px-4 (ratio 2:1)
- Don't: py-2 px-2 (ratio 1:1)
- Reasoning: `references/rules/layout-5.md` · https://axiomui.nischal.fyi/rules/layout-5

## Anchor a row icon to the text it describes (`layout-6`)

When an icon introduces a multiline notification, align it to the first line. Centering it in the whole text block moves it down as detail wraps. A single-line action can use centered alignment.

- Do: items-start + 1px top offset
- Don't: items-center on the whole text block
- Reasoning: `references/rules/layout-6.md` · https://axiomui.nischal.fyi/rules/layout-6

## Choose a boundary that explains the group (`layout-7`)

Use headings and space for related content that reads in sequence. A card surface or border can help when an item stands on its own or takes a distinct action.

- Do: White card on light gray bg
- Don't: White card with gray border on white bg
- Reasoning: `references/rules/layout-7.md` · https://axiomui.nischal.fyi/rules/layout-7

## Adapt outer spacing to available width (`layout-9`)

Reconsider large page and card insets when a layout narrows. Preserve the spacing that holds small controls and related text together. Change a token when the content shows why.

- Do: p-3 sm / p-6 lg
- Don't: p-6 sm / p-6 lg
- Reasoning: `references/rules/layout-9.md` · https://axiomui.nischal.fyi/rules/layout-9

## Use spacing to express vertical hierarchy (`layout-10`)

Give lines within one item, neighboring items, and major sections different spacing roles. Reuse the same role whenever that relationship recurs.

- Do: 8px / 16px / 32px section break
- Don't: 8px / 16px / 16px section break
- Reasoning: `references/rules/layout-10.md` · https://axiomui.nischal.fyi/rules/layout-10

## Define stacking order within each context (`layout-11`)

Give overlay roles an intentional order and identify the stacking context that contains them. A large z-index on a child cannot lift it above a higher sibling context or the browser’s top layer.

- Do: z-index: 9999 outside the transform, above Activity
- Don't: z-index: 9999 inside the transform, behind Activity
- Reasoning: `references/rules/layout-11.md` · https://axiomui.nischal.fyi/rules/layout-11

## Keep scroll and focus targets clear of sticky headers (`layout-12`)

Account for the height of sticky headers and footers in the scroll container. After an anchor jump or keyboard focus, the entire target should be visible.

- Do: scroll-padding-top: 64px
- Don't: scroll-padding-top: 0px
- Reasoning: `references/rules/layout-12.md` · https://axiomui.nischal.fyi/rules/layout-12

## Reserve space for media before it loads (`layout-13`)

Give images, videos, and embeds dimensions or an aspect ratio before they load. Reserve that space on the first render so nearby controls stay where people expect them.

- Do: aspect-ratio: 2 / 1 before load
- Don't: 0px reserved before load
- Reasoning: `references/rules/layout-13.md` · https://axiomui.nischal.fyi/rules/layout-13

## Keep the subject in the crop at every ratio (`layout-14`)

When an image fills frames of different proportions, check the crop at each ratio. Set a focal point or supply another crop so the subject stays in frame.

- Do: object-position: right center · latch in both crops
- Don't: object-position: center · latch cropped out
- Reasoning: `references/rules/layout-14.md` · https://axiomui.nischal.fyi/rules/layout-14

## Related rules in other domains

- `typo-14` Keep names and counts together across scripts (`references/typography.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/system.md`)
