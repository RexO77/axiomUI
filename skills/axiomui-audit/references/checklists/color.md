# Color & depth checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## 60-30-10 rule (`color-1`)

- Do: Mostly whites/grays, splashes of blue · Don't: Blue header, blue sidebar, blue buttons
- [ ] Does the primary color appear in only one or two places on screen?
- [ ] Are backgrounds and body text neutral rather than tinted with the brand hue?
- [ ] Do borders and subtitles form a distinct secondary layer instead of another step of the accent?
- Reasoning: `references/rules/color-1.md`

## Never pure black (`color-2`)

- Do: #0f172a on #ffffff (17.9:1) · Don't: #000000 on #ffffff (21:1)
- [ ] Is any text or background using literal #000000?
- [ ] Do stroke edges look settled rather than shimmering against the background?
- [ ] Are the darkest tokens a near-black with a slight hue rather than true black?
- Reasoning: `references/rules/color-2.md`

## Colored shadows (`color-3`)

- Do: shadow-indigo-500/20 · Don't: shadow-black/20
- [ ] Does the shadow under a colored element pick up that element’s hue?
- [ ] Would the shadow look wrong if swapped for flat black?
- [ ] Does the elevated element feel like it is floating rather than pasted on?
- Reasoning: `references/rules/color-3.md`

## Semantic colors (`color-4`)

- Do: Like icon: blue-500 · Don't: Like icon: rose-500
- [ ] Is red used anywhere besides errors or destructive actions?
- [ ] Is green used anywhere besides success confirmation?
- [ ] Would a user mistake a decorative icon for a system status signal?
- Reasoning: `references/rules/color-4.md`

## Border colors (`color-5`)

- Do: border: neutral-200 · Don't: border: neutral-400
- [ ] Do borders fade into the background rather than framing it heavily?
- [ ] Is any border darker than neutral-200 without a specific reason?
- [ ] Does content draw more attention than the dividers around it?
- Reasoning: `references/rules/color-5.md`

## Double contrast for borders (`color-6`)

- Do: input border: neutral-300 · divider: neutral-200 · Don't: input border: neutral-100 · divider: neutral-200
- [ ] Can you spot the outline button’s border without focusing hard?
- [ ] Is the interactive border visibly darker than passive divider borders?
- [ ] Does the input field read as clickable/editable at a glance?
- Reasoning: `references/rules/color-6.md`

## Hover = same hue (`color-7`)

- Do: blue-600 → blue-700 · Don't: blue-600 → green-600
- [ ] Does the hover color stay in the same hue family as the resting state?
- [ ] Could the hover state be mistaken for a status change like success?
- [ ] Is only the lightness/saturation shifting on interaction, not the hue?
- Reasoning: `references/rules/color-7.md`

## Dark mode isn't inverted (`color-8`)

- Do: bg neutral-900 / card neutral-800 / brand sat 91% → 55% · Don't: filter: invert(1) on the whole page
- [ ] Do elevated cards appear lighter than the page background in dark mode?
- [ ] Are brand colors visibly desaturated compared to the light theme?
- [ ] Do images and photos render normally, not as inverted negatives?
- Reasoning: `references/rules/color-8.md`

## Accessible contrast ratios (`color-9`)

- Do: #737373 on #ffffff (4.7:1) · Don't: #aaaaaa on #ffffff (2.3:1)
- [ ] Has every text color on this screen been measured rather than eyeballed?
- [ ] Does body text measure at least 4.5:1 against the background it actually sits on?
- [ ] Is any text leaning on the 3:1 allowance while sitting below 24px regular or 18.66px bold?
- Reasoning: `references/rules/color-9.md`

## Opacity over new colors (`color-10`)

- Do: Every state = blue-500 / alpha · Don't: Three hand-picked hexes
- [ ] Are tint backgrounds built from opacity of the base color, not new hexes?
- [ ] Would updating the brand color automatically update all its tint states?
- [ ] Are there multiple near-identical light-blue hexes scattered in the styles?
- Reasoning: `references/rules/color-10.md`

## Neutral image outlines (`color-11`)

- Do: outline-black/10 dark:outline-white/10 · Don't: outline-slate-900/10 in both themes
- [ ] Does every image have a subtle outline separating it from the background?
- [ ] Does the outline switch from black-based to white-based in dark mode?
- [ ] Is any image using a tinted gray outline instead of pure black or pure white?
- Reasoning: `references/rules/color-11.md`

## Shadows can replace borders (`color-12`)

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%) · Don't: border: 1px neutral-300 on every card
- [ ] Do raised cards use layered shadows instead of a hard border?
- [ ] Can you tell which surface is elevated without a visible stroke?
- [ ] Does the card edge look soft and lifted rather than sharply outlined?
- Reasoning: `references/rules/color-12.md`
