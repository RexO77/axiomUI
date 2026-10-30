# Layout & spacing checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## The 4pt grid system (`layout-1`)

- Do: 4px, 8px, 16px, 24px, 32px, 48px · Don't: 13px, 5px
- [ ] Does every margin and padding value divide evenly by 4?
- [ ] Do adjacent components share the same base spacing unit?
- [ ] Are there any hardcoded odd pixel values, like 13px or 5px, in the styles?
- Reasoning: `references/rules/layout-1.md`

## Text width limits (`layout-2`)

- Do: max-w: 45ch · Don't: width: 100%
- [ ] Can you count roughly 45-75 characters per line of body text at the widest breakpoint?
- [ ] Does any paragraph stretch edge-to-edge on a large monitor?
- [ ] Is a character-based cap applied to every text container, rather than letting it fill the viewport?
- Reasoning: `references/rules/layout-2.md`

## Group by proximity (`layout-3`)

- Do: Label (gap-2) Input (gap-6) Next Label · Don't: Label (gap-4) Input (gap-4) Next Label
- [ ] Is the gap between a label and its input visibly smaller than the gap before the next label?
- [ ] Could a user tell which label belongs to which field with all borders removed?
- [ ] Are related items grouped by whitespace rather than by a line separator?
- Reasoning: `references/rules/layout-3.md`

## Visual vs mathematical center (`layout-4`)

- Do: Play icon nudged +2px right · Don't: Play icon on the geometric center
- [ ] Does the icon look centered when you squint at it, not just measure it?
- [ ] Has an asymmetric icon like a play triangle been nudged off mathematical center?
- [ ] Would swapping in a symmetric icon reveal a now mis-centered container?
- Reasoning: `references/rules/layout-4.md`

## Button padding formula (`layout-5`)

- Do: py-2 px-4 (ratio 2:1) · Don't: py-2 px-2 (ratio 1:1)
- [ ] Is the horizontal padding noticeably larger than the vertical padding on this button?
- [ ] Does the button look square or cramped rather than proportioned around its label?
- [ ] Do icon-only buttons use different, equal padding compared to text buttons?
- Reasoning: `references/rules/layout-5.md`

## Optical alignment of icons (`layout-6`)

- Do: items-start (icon on the cap height) · Don't: items-center (icon on the line box)
- [ ] Does the icon’s optical center line up with the cap height of the adjacent text?
- [ ] Does the icon look like it’s sitting slightly low or high relative to the label?
- [ ] Was the alignment verified by eye rather than trusting flex-center alone?
- Reasoning: `references/rules/layout-6.md`

## The container fallacy (`layout-7`)

- Do: White card on light gray bg · Don't: White card with gray border on white bg
- [ ] Is background-color contrast, rather than a border, doing the work of separating this section?
- [ ] Would sections still look distinct if every border line were removed?
- [ ] Is there a box with a border sitting on top of an already-contrasting background?
- Reasoning: `references/rules/layout-7.md`

## Consistent gutters (`layout-8`)

- Do: Cards: gap-2 throughout · Don't: Rows gap-6, columns gap-2
- [ ] Is the same gap value used for both rows and columns in this grid?
- [ ] Do any two adjacent grids in the same region use different gutter sizes?
- [ ] Does the spacing rhythm feel like one system rather than several stitched together?
- Reasoning: `references/rules/layout-8.md`

## Responsive spacing scaling (`layout-9`)

- Do: p-3 sm / p-6 lg · Don't: p-6 sm / p-6 lg
- [ ] Does padding visibly shrink from desktop to tablet to mobile breakpoints?
- [ ] Is any padding or margin value identical at every breakpoint?
- [ ] Does content on the smallest screen retain a reasonable amount of usable width?
- Reasoning: `references/rules/layout-9.md`

## Vertical rhythm (`layout-10`)

- Do: 8 → 16 → 32px (1x, 2x, 4x of 8) · Don't: 8 → 13 → 18px (off the 8px base)
- [ ] Is every section gap a whole multiple of the smallest gap on the page?
- [ ] Can you tell which section breaks are major versus minor from the gap size alone?
- [ ] Do any two adjacent section gaps differ by an amount that is not a step in the scale?
- Reasoning: `references/rules/layout-10.md`

## Z-index scale (`layout-11`)

- Do: z-dropdown: 100, z-modal: 300 · Don't: z-index: 9999
- [ ] Does every stacked element, dropdown, sticky header, modal, toast, use a value from the defined scale?
- [ ] Is there any arbitrary z-index value like 9999 anywhere in the styles?
- [ ] Do toasts and modals stack in the correct visual order when triggered together?
- Reasoning: `references/rules/layout-11.md`
