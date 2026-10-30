# Layout & spacing

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## The 4pt grid system (`layout-1`)

Every margin, padding, and height should be divisible by 4. A fixed step means components built by different people still line up, and nobody has to defend a 13px gap.

- Do: 4px, 8px, 16px, 24px, 32px, 48px
- Don't: 13px, 5px
- Reasoning: `references/rules/layout-1.md` · https://axiomui.nischal.fyi/rules/layout-1

## Text width limits (`layout-2`)

Lines of text should run 45-75 characters. Past that the return sweep to the next line gets harder to aim, and readers start losing their place mid-paragraph.

- Do: max-w: 45ch
- Don't: width: 100%
- Reasoning: `references/rules/layout-2.md` · https://axiomui.nischal.fyi/rules/layout-2

## Group by proximity (`layout-3`)

Items that belong together should sit closer than items that don't. Proximity groups faster than a border can, and it costs no ink.

- Do: Label (gap-2) Input (gap-6) Next Label
- Don't: Label (gap-4) Input (gap-4) Next Label
- Reasoning: `references/rules/layout-3.md` · https://axiomui.nischal.fyi/rules/layout-3

## Visual vs mathematical center (`layout-4`)

Icons with lopsided mass — a play triangle, a send arrow — read as off-center when centered by their bounding box. The eye centers visual weight, not the box.

- Do: Play icon nudged +2px right
- Don't: Play icon on the geometric center
- Reasoning: `references/rules/layout-4.md` · https://axiomui.nischal.fyi/rules/layout-4

## Button padding formula (`layout-5`)

Horizontal padding should be roughly 1.5x to 2x the vertical padding. Text runs sideways, so equal padding on all four sides leaves a label crowded against the left and right edges.

- Do: py-2 px-4 (ratio 2:1)
- Don't: py-2 px-2 (ratio 1:1)
- Reasoning: `references/rules/layout-5.md` · https://axiomui.nischal.fyi/rules/layout-5

## Optical alignment of icons (`layout-6`)

Align an icon beside text to the cap height of that text, not to the full line box. The line box includes the leading above and below the letters, so centering on it drops the icon visually low.

- Do: items-start (icon on the cap height)
- Don't: items-center (icon on the line box)
- Reasoning: `references/rules/layout-6.md` · https://axiomui.nischal.fyi/rules/layout-6

## The container fallacy (`layout-7`)

Don't put every section in a bordered box. Use a background shade or plain space instead: each border is another line competing for attention, and space separates just as well for no ink.

- Do: White card on light gray bg
- Don't: White card with gray border on white bg
- Reasoning: `references/rules/layout-7.md` · https://axiomui.nischal.fyi/rules/layout-7

## Consistent gutters (`layout-8`)

Within one grid, use one gutter for siblings of the same kind. Vary the gap only to show grouping; otherwise mixed gaps feel accidental.

- Do: Cards: gap-2 throughout
- Don't: Rows gap-6, columns gap-2
- Reasoning: `references/rules/layout-8.md` · https://axiomui.nischal.fyi/rules/layout-8

## Responsive spacing scaling (`layout-9`)

Don't ship one spacing scale to every breakpoint. Scale padding and margins down on small screens — a 48px gutter spends an eighth of a 375px viewport on nothing.

- Do: p-3 sm / p-6 lg
- Don't: p-6 sm / p-6 lg
- Reasoning: `references/rules/layout-9.md` · https://axiomui.nischal.fyi/rules/layout-9

## Vertical rhythm (`layout-10`)

Every section gap should be a whole multiple of one base unit, so the smallest gap becomes a unit the eye can count in. Values off that base read as accidental.

- Do: 8 → 16 → 32px (1x, 2x, 4x of 8)
- Don't: 8 → 13 → 18px (off the 8px base)
- Reasoning: `references/rules/layout-10.md` · https://axiomui.nischal.fyi/rules/layout-10

## Z-index scale (`layout-11`)

Define a z-index scale (base 0, dropdown 100, sticky 200, modal 300, toast 400) and only use its steps. Arbitrary values turn every new overlay into a bidding war that ends at 9999.

- Do: z-dropdown: 100, z-modal: 300
- Don't: z-index: 9999
- Reasoning: `references/rules/layout-11.md` · https://axiomui.nischal.fyi/rules/layout-11
