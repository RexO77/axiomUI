# Color & depth

Compact Do/Don’t for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Use accent color to mark priority (`color-1`)

Save the strongest accent for what people should notice first. Use 60-30-10 as a rough guide to how much of each color to use.

- Do: Blue only on the New report button
- Don’t: Blue header, blue sidebar, blue buttons
- Reasoning: `references/rules/color-1.md` · https://axiomui.nischal.fyi/rules/color-1

## Use status colors consistently (`color-4`)

Pair each status color with a label or recognizable symbol. If red marks Delete, give the Like heart beside it a different color.

- Do: Like icon · blue-500 in light mode, blue-400 in dark mode
- Don’t: Like icon · rose-500 in light mode, rose-400 in dark mode
- Reasoning: `references/rules/color-4.md` · https://axiomui.nischal.fyi/rules/color-4

## Give essential control edges at least 3:1 contrast (`color-6`)

If a border is how people recognize an enabled control, WCAG AA requires at least 3:1 contrast against the color beside it. Decorative dividers can be fainter. Check both themes.

- Do: Light mode · input border neutral-500 · divider neutral-200. Dark mode · input border neutral-400 · divider neutral-800
- Don’t: Light mode · input border neutral-100 · divider neutral-200. Dark mode · input border neutral-900 · divider neutral-800
- Reasoning: `references/rules/color-6.md` · https://axiomui.nischal.fyi/rules/color-6

## Keep hover distinct from success (`color-7`)

If green signals success, keep the button blue on hover. A darker blue shows that the pointer is over it.

- Do: blue-600 → blue-700
- Don’t: blue-600 → green-600
- Reasoning: `references/rules/color-7.md` · https://axiomui.nischal.fyi/rules/color-7

## Design the dark palette by role (`color-8`)

Choose dark-theme colors for each role. A lighter card stands out against a dark page. Adjust the accent for its background and keep photos in their original colors.

- Do: Page neutral-900 · card neutral-800 · blue saturation 91% → 55%
- Don’t: filter: invert(1) on the whole page
- Reasoning: `references/rules/color-8.md` · https://axiomui.nischal.fyi/rules/color-8

## Check text contrast (`color-9`)

WCAG AA requires at least 4.5:1 contrast for ordinary text and 3:1 for large text. Measure against the background behind the letters, including images and overlays. Use the unrounded ratio.

- Do: #737373 on #ffffff (4.7:1)
- Don’t: #aaaaaa on #ffffff (2.3:1)
- Reasoning: `references/rules/color-9.md` · https://axiomui.nischal.fyi/rules/color-9

## Derive state fills from one color (`color-10`)

Derive hover and selection fills from one base color. A translucent fill picks up the background beneath it. Use an opaque fill when its color should stay the same across surfaces.

- Do: Hover blue-500/10 · selected blue-500/15
- Don’t: Hover #e8f0fe · selected #dcebf5 with #1967d2 text
- Reasoning: `references/rules/color-10.md` · https://axiomui.nischal.fyi/rules/color-10

## Outline images that blend into the page (`color-11`)

If a thumbnail blends into the page, try a 1px inset outline. The example uses black at 10% opacity on white and white at 10% on dark. Skip the outline when the image already has a clear edge.

- Do: outline-black/10 dark:outline-white/10
- Don’t: outline-slate-900/10 in both themes
- Reasoning: `references/rules/color-11.md` · https://axiomui.nischal.fyi/rules/color-11

## Use shadows to show depth (`color-12`)

Give a raised card three shadow layers. A 1px ring marks the edge, a tight shadow sits underneath, and a wider shadow adds depth. A divider can separate flat rows. Keep essential edges visible in forced-colors mode.

- Do: 0 0 0 1px rgb(0 0 0 / 6%), 0 1px 2px rgb(0 0 0 / 10%), 0 8px 20px -6px rgb(0 0 0 / 18%) · light mode
- Don’t: 1px border on every card · neutral-300 in light mode, neutral-600 in dark mode
- Reasoning: `references/rules/color-12.md` · https://axiomui.nischal.fyi/rules/color-12
