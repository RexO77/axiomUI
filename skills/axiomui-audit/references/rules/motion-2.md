# Focus the palette field on open

- ID: motion-2
- Category: Motion & interaction
- Tags: Keyboard, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-2

When a shortcut opens a command palette, focus its field immediately so people can type while it opens.

- Do: Focus on open. First keystrokes land.
- Don’t: Focus after entrance. First keystrokes are lost.

## Why it works

Both palettes take 180ms to open. Halfway through, the example types “op”. The field focused on open shows both letters. The field focused after the entrance stays empty.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WHATWG HTML · Focus](https://html.spec.whatwg.org/multipage/interaction.html#focus)
- [Apple HIG · Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [WCAG 2.2 · Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [Emil Kowalski · You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations)

## What breaks

A missing first character sends the user into a different set of results. Escape during entry can also leave focus behind a closing overlay.

## How to apply it

1. Focus the field as soon as the panel mounts.
2. Keep the input and its focus indicator visible while typing.
3. Open, type and dismiss without pausing between keys.

## Before you ship

1. Does the first character appear in the query?
2. Where does focus return after Escape during entry?
3. Can the user see the currently focused control throughout?
