# Color & depth checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Use accent color to mark priority (`color-1`)

- Do: Mostly whites/grays, splashes of blue · Don't: Blue header, blue sidebar, blue buttons
- [ ] Which item should a reader find first?
- [ ] Where else does its accent appear nearby?
- [ ] Can the intended action still be identified without color?
- Reasoning: `references/rules/color-1.md`

## Use the intended text color (`color-2`)

- Do: #0f172a on #ffffff (17.9:1) · Don't: #000000 on #ffffff (21:1)
- [ ] Does the card use the expected text role?
- [ ] What ratio does the pair produce on this surface?
- [ ] Do important details remain visible in increased-contrast settings?
- Reasoning: `references/rules/color-2.md`

## Match shadows to their role (`color-3`)

- Do: Campaign shadow: indigo tint · Don't: Same campaign card: black shadow
- [ ] Does this shadow represent ordinary elevation or a specific visual treatment?
- [ ] Does it compete with focus or selection cues?
- [ ] Can the content stand on its own when shadows disappear?
- Reasoning: `references/rules/color-3.md`

## Make status colors dependable (`color-4`)

- Do: Like icon: blue-500 · Don't: Like icon: rose-500
- [ ] How does a reader identify the dangerous action?
- [ ] Could the same accent describe different states within this row?
- [ ] Which cue remains if the two hues look identical?
- Reasoning: `references/rules/color-4.md`

## Keep decorative dividers quiet (`color-5`)

- Do: border: neutral-200 · Don't: border: neutral-400
- [ ] Can a reader still pair each label with its value?
- [ ] Is this boundary decorative or required to locate something?
- [ ] Do changes in surface color alter that answer?
- Reasoning: `references/rules/color-5.md`

## Give essential control edges enough contrast (`color-6`)

- Do: input border: neutral-500 · divider: neutral-200 · Don't: input border: neutral-100 · divider: neutral-200
- [ ] Without the border, can a reader still find the field?
- [ ] Does the required cue reach 3:1 on the adjacent surface?
- [ ] Are focused and selected controls identifiable by their own cues?
- Reasoning: `references/rules/color-6.md`

## Keep hover feedback distinct from a result (`color-7`)

- Do: blue-600 → blue-700 · Don't: blue-600 → green-600
- [ ] What does the color change communicate here?
- [ ] Is completion still distinct from hovering?
- [ ] Can the control be found before hover occurs?
- Reasoning: `references/rules/color-7.md`

## Design the dark palette by role (`color-8`)

- Do: bg neutral-900 / card neutral-800 / brand sat 91% → 55% · Don't: filter: invert(1) on the whole page
- [ ] Are the surface boundaries clear at each level?
- [ ] Can the usage indicator be read on the dark track?
- [ ] Is the preview still a faithful representation of the file?
- Reasoning: `references/rules/color-8.md`

## Accessible contrast ratios (`color-9`)

- Do: #737373 on #ffffff (4.7:1) · Don't: #aaaaaa on #ffffff (2.3:1)
- [ ] What measured pair supports the verdict?
- [ ] If large-text thresholds are used, what size and weight qualify it?
- [ ] Does it pass at the least contrasting background behind the letters?
- Reasoning: `references/rules/color-9.md`

## Give state colors a shared source (`color-10`)

- Do: Every state = blue-500 / alpha · Don't: Three hand-picked hexes
- [ ] Does the selected row stay distinguishable from a hovered row?
- [ ] Can the label still be read over the composited fill?
- [ ] Which states should change when the brand color changes?
- Reasoning: `references/rules/color-10.md`

## Define image edges when they disappear (`color-11`)

- Do: outline-black/10 dark:outline-white/10 · Don't: outline-slate-900/10 in both themes
- [ ] Is the edge difficult to locate in this crop?
- [ ] Does the line remain subordinate to the image?
- [ ] Can people distinguish the frame from focus or selection?
- Reasoning: `references/rules/color-11.md`

## Use elevation when a surface is raised (`color-12`)

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%) · Don't: border: 1px neutral-300 on every card
- [ ] What relationship does elevation communicate here?
- [ ] Does the boundary remain visible when shadows are suppressed?
- [ ] Can selection be distinguished from ordinary elevation?
- Reasoning: `references/rules/color-12.md`
