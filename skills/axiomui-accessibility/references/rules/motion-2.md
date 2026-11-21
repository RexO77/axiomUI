# Keep keyboard input responsive

- ID: motion-2
- Category: Motion & interaction
- Tags: Keyboard, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-2

When a shortcut opens a command palette, move focus into the field and accept the next keystroke while the panel settles.

- Do: Focus on open. First keystrokes land.
- Don't: Focus after entrance. First keystrokes are lost.

## Why it works

Opening a palette and typing a query is one keyboard sequence. Both palettes share the same entrance, and the field focused on open receives the first keystrokes. Waiting for the panel to settle can send those characters to the previous control.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [web.dev · Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

## What breaks

A missing first character sends the user into a different set of results. Escape during entry can also leave focus behind a closing overlay.

## How to apply it

1. Choose the initial focus target when mounting the panel.
2. Keep the input and its focus indicator visible while typing.
3. Open, type and dismiss without pausing between keys.

## Review questions

1. Does the first character appear in the query?
2. Where does focus return after Escape during entry?
3. Can the user see the currently focused control throughout?
