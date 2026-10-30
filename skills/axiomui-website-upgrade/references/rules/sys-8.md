# Keyboard navigation

- ID: sys-8
- Category: System & logic
- Tags: Keyboard, Navigation, Accessibility
- URL: https://axiomui.nischal.fyi/rules/sys-8

All interactive elements must be reachable via Tab, activatable via Enter/Space, and dismissible via Escape.

- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support

## Why it works

Keyboard accessibility is a parallel input model, not an extra layer on mouse interaction: Tab moves focus, Enter or Space activates, Escape dismisses, mirroring how screen reader and switch-device users navigate exclusively. Click-only interactions with no keyboard path lock these users out of core functionality entirely.

## What breaks

An Archive project? dialog whose buttons sit at tabindex -1 with no Escape handler cannot be reached or dismissed from the keyboard at all: Tab walks straight past both buttons into the page behind, Escape does nothing, and the only exit left is a page reload that discards whatever the user was doing.

## How to apply it

1. Verify every interactive element completes the Tab, Enter, Esc flow, not just click handlers.
2. Add visible focus rings so keyboard position is never invisible.
3. Wire Escape to dismiss modals, dropdowns, and popovers consistently.
4. Trap focus inside open modals so Tab does not leak to background content.

## Review questions

1. Can every interactive element be reached by pressing Tab alone?
2. Does pressing Enter or Space activate the focused element?
3. Does pressing Escape dismiss the current modal or menu?
