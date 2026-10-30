# Color & depth

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## 60-30-10 rule (`color-1`)

Split the palette roughly 60% neutral surface and text, 30% secondary structure like borders and subtitles, 10% primary. An accent only reads as an accent while it stays rare.

- Do: Mostly whites/grays, splashes of blue
- Don't: Blue header, blue sidebar, blue buttons
- Reasoning: `references/rules/color-1.md` · https://axiomui.nischal.fyi/rules/color-1

## Never pure black (`color-2`)

Pure black (#000000) creates eye strain against white. Use a very dark gray or blue-gray.

- Do: #0f172a on #ffffff (17.9:1)
- Don't: #000000 on #ffffff (21:1)
- Reasoning: `references/rules/color-2.md` · https://axiomui.nischal.fyi/rules/color-2

## Colored shadows (`color-3`)

Shadows in real life are rarely gray. They pick up the color of the object. Mix your brand color into the shadow.

- Do: shadow-indigo-500/20
- Don't: shadow-black/20
- Reasoning: `references/rules/color-3.md` · https://axiomui.nischal.fyi/rules/color-3

## Semantic colors (`color-4`)

Don't spend red, green, or amber on decoration; reserve them for error, success, and warning. Once red also means 'liked', it can no longer mean 'something went wrong'.

- Do: Like icon: blue-500
- Don't: Like icon: rose-500
- Reasoning: `references/rules/color-4.md` · https://axiomui.nischal.fyi/rules/color-4

## Border colors (`color-5`)

Borders should sit well below text contrast — if your text is neutral-900, your borders belong near neutral-200. A border is structure, not content, and at text contrast it competes with the words it frames.

- Do: border: neutral-200
- Don't: border: neutral-400
- Reasoning: `references/rules/color-5.md` · https://axiomui.nischal.fyi/rules/color-5

## Double contrast for borders (`color-6`)

An interactive edge needs more contrast than a passive divider, so inputs and outline buttons should sit a step darker. A border has to be found before it can be clicked.

- Do: input border: neutral-300 · divider: neutral-200
- Don't: input border: neutral-100 · divider: neutral-200
- Reasoning: `references/rules/color-6.md` · https://axiomui.nischal.fyi/rules/color-6

## Hover = same hue (`color-7`)

Hover and active states should stay in the same hue and only move lightness or saturation. A hue shift reads as a different element, not as the same element responding.

- Do: blue-600 → blue-700
- Don't: blue-600 → green-600
- Reasoning: `references/rules/color-7.md` · https://axiomui.nischal.fyi/rules/color-7

## Dark mode isn't inverted (`color-8`)

Dark mode is not an inverted light theme. Reduce surface contrast, desaturate brand colors, and flip the elevation model so a lighter surface reads as a higher one.

- Do: bg neutral-900 / card neutral-800 / brand sat 91% → 55%
- Don't: filter: invert(1) on the whole page
- Reasoning: `references/rules/color-8.md` · https://axiomui.nischal.fyi/rules/color-8

## Accessible contrast ratios (`color-9`)

Text must meet WCAG AA contrast (4.5:1 for body, 3:1 for large text). Don't eyeball it — check it.

- Do: #737373 on #ffffff (4.7:1)
- Don't: #aaaaaa on #ffffff (2.3:1)
- Reasoning: `references/rules/color-9.md` · https://axiomui.nischal.fyi/rules/color-9

## Opacity over new colors (`color-10`)

Build hover, pressed, and tint states from one color plus an alpha value (bg-blue-500/10) instead of hand-picking a hex per state. A token with alpha follows the brand when it changes; a pasted hex does not.

- Do: Every state = blue-500 / alpha
- Don't: Three hand-picked hexes
- Reasoning: `references/rules/color-10.md` · https://axiomui.nischal.fyi/rules/color-10

## Neutral image outlines (`color-11`)

Images need a subtle inset outline for edge definition. Use pure black at low opacity in light mode and pure white at low opacity in dark mode.

- Do: outline-black/10 dark:outline-white/10
- Don't: outline-slate-900/10 in both themes
- Reasoning: `references/rules/color-11.md` · https://axiomui.nischal.fyi/rules/color-11

## Shadows can replace borders (`color-12`)

For cards, buttons, and raised containers, layered transparent shadows define an edge more cleanly than a border. A border draws one hard line at full strength; a shadow describes the same edge with a falloff, so the card lifts instead of being outlined.

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 2px 4px rgb(0 0 0 / 4%)
- Don't: border: 1px neutral-300 on every card
- Reasoning: `references/rules/color-12.md` · https://axiomui.nischal.fyi/rules/color-12
