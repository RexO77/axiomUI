# Use the keys people expect for each control

- ID: sys-8
- Category: System & logic
- Tags: Keyboard, Navigation, Accessibility
- URL: https://axiomui.nischal.fyi/rules/sys-8

Make every task usable by keyboard. Use native controls where possible. Tab moves between controls, arrow keys move within groups such as tabs and radio buttons, and Escape closes a modal dialog.

- Do: Tab moves focus · Enter activates · Esc dismisses
- Don’t: Tab skips Archive · Esc does nothing

## Why it works

Enter or Space activates a button. Enter follows a link. In a radio group, Tab enters the group and arrow keys move between options.

- [WCAG 2.2 · Keyboard access](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [WAI-ARIA APG · Keyboard interface practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [W3C WAI · Using HTML controls and links](https://www.w3.org/WAI/WCAG22/Techniques/html/H91)
- [WAI-ARIA APG · Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [web.dev · Keyboard focus](https://web.dev/learn/accessibility/focus)

## What breaks

In the preview, Tab skips Archive and Escape cannot close the dialog. In a long toolbar, a Tab stop on every button forces someone to cross the whole toolbar to leave it.

## How to apply it

1. Keep a meaningful focus order and a visible focus indicator.
2. Follow the keyboard pattern for the widget. For tabs, menus and radio groups, support arrow keys within the group.
3. Keep Tab inside an open modal and close it on Escape. Return focus to the control that opened it, or to the next logical control if the opener is gone.

## Before you ship

1. Can the task be completed end to end without a pointer?
2. Which keys does this control’s role lead users to expect?
3. After dismissal, can the person continue from a sensible location?
