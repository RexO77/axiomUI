# Layout & spacing checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Use a shared spacing scale (`layout-1`)

- Do: 4px, 8px, 16px, 24px, 32px, 48px · Don't: 13px, 5px
- [ ] Do comparable components use the same spacing step?
- [ ] Does each larger gap represent a different relationship?
- [ ] Would rounding this exception improve the result?
- Reasoning: `references/rules/layout-1.md`

## Set a measure for long-form text (`layout-2`)

- Do: max-width: 45ch · Don't: width: 100%
- [ ] Does the paragraph retain a comfortable measure on a wide display?
- [ ] Can the column shrink to fit a narrow viewport?
- [ ] Do tables and figures have the width their content needs?
- Reasoning: `references/rules/layout-2.md`

## Show which items belong together (`layout-3`)

- Do: Label (gap-2) Input (gap-6) Next Label · Don't: Label (gap-4) Input (gap-4) Next Label
- [ ] Which control does each visible label describe?
- [ ] Does the accessible name match the visible label?
- [ ] When an error appears, is the next group still distinct?
- Reasoning: `references/rules/layout-3.md`

## Optically center asymmetric glyphs (`layout-4`)

- Do: Play icon nudged +2px right · Don't: Play icon on the geometric center
- [ ] Does the artwork appear centered with the guide removed?
- [ ] Does the control stay visually stable as its icon changes?
- [ ] Is the offset specific to this glyph and size?
- Reasoning: `references/rules/layout-4.md`

## Size button padding around the label (`layout-5`)

- Do: py-2 px-4 (ratio 2:1) · Don't: py-2 px-2 (ratio 1:1)
- [ ] Does the label have enough space beside it?
- [ ] Can the button wrap or grow when text enlarges?
- [ ] How large is the area that actually responds?
- Reasoning: `references/rules/layout-5.md`

## Anchor a row icon to the text it describes (`layout-6`)

- Do: items-start + 1px top offset · Don't: items-center on the whole text block
- [ ] Does the bell still sit beside the title after a wrap?
- [ ] Does the artwork look aligned inside its SVG box?
- [ ] Would a single-line version need a different treatment?
- Reasoning: `references/rules/layout-6.md`

## Choose a boundary that explains the group (`layout-7`)

- Do: White card on light gray bg · Don't: White card with gray border on white bg
- [ ] What does this edge tell the reader?
- [ ] Can the items be reordered independently?
- [ ] Can a reader tell which action belongs to each item?
- Reasoning: `references/rules/layout-7.md`

## Consistent gutters (`layout-8`)

- Do: Cards: gap-2 throughout · Don't: Rows gap-6, columns gap-2
- [ ] Does the pattern imply rows, columns, or independent cards?
- [ ] Is that grouping meaningful in the content?
- [ ] What happens to the gutters when the grid loses a column?
- Reasoning: `references/rules/layout-8.md`

## Adapt outer spacing to available width (`layout-9`)

- Do: p-3 sm / p-6 lg · Don't: p-6 sm / p-6 lg
- [ ] Which gutter costs useful reading space?
- [ ] Do interactive targets retain enough size and separation?
- [ ] Does the layout work when a card narrows independently of the viewport?
- Reasoning: `references/rules/layout-9.md`

## Use spacing to express vertical hierarchy (`layout-10`)

- Do: 8 → 16 → 32px (1x, 2x, 4x of 8) · Don't: 8 → 13 → 18px (off the 8px base)
- [ ] Where does one item end and the next section begin?
- [ ] Do repeated sections have consistent spacing?
- [ ] Does a larger break correspond to a meaningful boundary?
- Reasoning: `references/rules/layout-10.md`

## Define stacking order within each context (`layout-11`)

- Do: z-dropdown: 100, z-modal: 300 · Don't: z-index: 9999
- [ ] Which context owns each competing element?
- [ ] Does the visual order match focus and pointer behavior?
- [ ] Can feedback for an action still be seen inside the active dialog?
- Reasoning: `references/rules/layout-11.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `typo-14` Keep names and counts together across scripts (`references/checklists/typography.md`)
