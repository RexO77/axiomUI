# Color & depth checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Use accent color to mark priority (`color-1`)

Reserve the strongest accent for the action or information that should stand out in its immediate context. The familiar 60-30-10 split is a composition prompt. The page has no required color percentages.

- Do: Mostly whites/grays, splashes of blue · Don't: Blue header, blue sidebar, blue buttons
- [ ] Which item should a reader find first?
- [ ] Where else does its accent appear nearby?
- [ ] Can the intended action still be identified without color?
- Reasoning: `references/rules/color-1.md`

## Make status colors dependable (`color-4`)

Give status roles a consistent meaning in context and pair them with labels or recognizable symbols. A red heart can express affection. Reserve a distinct treatment for a destructive command shown beside it.

- Do: Like icon: blue-500 · Don't: Like icon: rose-500
- [ ] How does a reader identify the dangerous action?
- [ ] Could the same accent describe different states within this row?
- [ ] Which cue remains if the two hues look identical?
- Reasoning: `references/rules/color-4.md`

## Give essential control edges enough contrast (`color-6`)

When a boundary is needed to identify an enabled control, WCAG AA requires at least 3:1 contrast against its adjacent color. A decorative divider may be quieter. Check the actual pair in each theme.

- Do: input border: neutral-500 · divider: neutral-200 · Don't: input border: neutral-100 · divider: neutral-200
- [ ] Without the border, can a reader still find the field?
- [ ] Does the required cue reach 3:1 on the adjacent surface?
- [ ] Are focused and selected controls identifiable by their own cues?
- Reasoning: `references/rules/color-6.md`

## Keep hover feedback distinct from a result (`color-7`)

A hover treatment should communicate availability without implying the operation has completed. A darker shade of the button’s existing color works when green is reserved nearby for success.

- Do: blue-600 → blue-700 · Don't: blue-600 → green-600
- [ ] What does the color change communicate here?
- [ ] Is completion still distinct from hovering?
- [ ] Can the control be found before hover occurs?
- Reasoning: `references/rules/color-7.md`

## Design the dark palette by role (`color-8`)

Define dark-theme colors for text, surfaces, states, and media. Lighter raised surfaces can distinguish layers when dark shadows are subtle. Tune the accent against its surroundings and preserve meaningful image colors.

- Do: bg neutral-900 / card neutral-800 / brand sat 91% → 55% · Don't: filter: invert(1) on the whole page
- [ ] Are the surface boundaries clear at each level?
- [ ] Can the usage indicator be read on the dark track?
- [ ] Is the preview still a faithful representation of the file?
- Reasoning: `references/rules/color-8.md`

## Accessible contrast ratios (`color-9`)

For WCAG AA, ordinary text needs at least 4.5:1 contrast. Large text qualifies at 3:1. Measure unrounded values against the actual background, including overlays and images behind the text.

- Do: #737373 on #ffffff (4.7:1) · Don't: #aaaaaa on #ffffff (2.3:1)
- [ ] What measured pair supports the verdict?
- [ ] If large-text thresholds are used, what size and weight qualify it?
- [ ] Does it pass at the least contrasting background behind the letters?
- Reasoning: `references/rules/color-9.md`

## Give state colors a shared source (`color-10`)

Map hover and selection colors to named state roles. A translucent fill can adapt to the surface beneath it. An opaque token can be preferable when the state needs a predictable appearance across surfaces.

- Do: Every state = blue-500 / alpha · Don't: Three hand-picked hexes
- [ ] Does the selected row stay distinguishable from a hovered row?
- [ ] Can the label still be read over the composited fill?
- [ ] Which states should change when the brand color changes?
- Reasoning: `references/rules/color-10.md`

## Define image edges when they disappear (`color-11`)

When a thumbnail blends into its surrounding surface, try a subtle inset edge. Choose its tone for the theme. Full-bleed imagery and images with clear edges may need no outline.

- Do: outline-black/10 dark:outline-white/10 · Don't: outline-slate-900/10 in both themes
- [ ] Is the edge difficult to locate in this crop?
- [ ] Does the line remain subordinate to the image?
- [ ] Can people distinguish the frame from focus or selection?
- Reasoning: `references/rules/color-11.md`

## Use elevation when a surface is raised (`color-12`)

When a surface sits above another, a crisp shadow plus a soft drop can communicate its edge and depth. A flat item may need only a divider. Keep essential boundaries visible in forced colors.

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%) · Don't: border: 1px neutral-300 on every card
- [ ] What relationship does elevation communicate here?
- [ ] Does the boundary remain visible when shadows are suppressed?
- [ ] Can selection be distinguished from ordinary elevation?
- Reasoning: `references/rules/color-12.md`
