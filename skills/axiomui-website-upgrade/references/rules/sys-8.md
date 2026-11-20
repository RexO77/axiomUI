# Follow the keyboard model for each control

- ID: sys-8
- Category: System & logic
- Tags: Keyboard, Navigation, Accessibility
- URL: https://axiomui.nischal.fyi/rules/sys-8

Make each task operable by keyboard. Use native behavior where available. Tab moves between stops, arrow keys often move within groups, and Escape dismisses a modal dialog.

- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support

## Why it works

A button commonly accepts Enter or Space, whereas a link normally follows its destination on Enter. A radio group may be one Tab stop with arrow navigation inside. Matching those expectations gives a person a usable path without making every child a separate stop.

- [WCAG 2.2 · Keyboard access](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [WAI-ARIA APG · Keyboard interface practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

## What breaks

A modal whose actions are missing from the tab sequence can leave the keyboard behind the overlay. Conversely, a long toolbar with a separate stop for every possible child can make repeated navigation expensive.

## How to apply it

1. Keep a meaningful focus order and a visible focus indicator.
2. Implement the keyboard pattern for the actual widget, including arrow keys in composites where specified.
3. Contain Tab within an open modal, support Escape and restore focus to the opener or a logical successor.

## Review questions

1. Can the task be completed end to end without a pointer?
2. Which keys does this control’s role lead users to expect?
3. After dismissal, can the person continue from a sensible location?
