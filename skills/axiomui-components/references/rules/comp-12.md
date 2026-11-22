# Show how to close a dialog

- ID: comp-12
- Category: Components & actions
- Tags: Overlays, Keyboard, Accessibility
- URL: https://axiomui.nischal.fyi/rules/comp-12

Give dismissible dialogs a visible Close or Cancel button and support Escape. Allow a click outside to close the dialog when closing it loses no work.

- Do: Close button, Escape or click outside
- Don’t: No close button, only backdrop click

## Why it works

Closing the Keyboard shortcuts dialog loses no work, so a click outside can close it. In an editor, preserve the draft or ask what to do with unsaved changes before closing.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Apple HIG · Modality](https://developer.apple.com/design/human-interface-guidelines/modality)
- [HTML · Dialog light dismiss](https://html.spec.whatwg.org/multipage/interactive-elements.html#attr-dialog-closedby)
- [MDN · The dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [Fluent · Dialog dismissal](https://fluent2.microsoft.design/components/web/react/core/dialog/usage/#dismissal)

## What breaks

A backdrop-only exit gives keyboard users no Close button to focus. In an editor, one stray click outside can discard a draft.

## How to apply it

1. Include a labeled dismissal control in the dialog’s tab sequence.
2. Have Escape close the topmost dismissible dialog. Return focus to its opener if it’s still available, or to the next control in the task.
3. Check for unsaved edits whether someone uses Close, Escape or a click outside.

## Before you ship

1. Can a keyboard user discover how to leave?
2. What happens to an unsaved edit after Escape or a backdrop click?
3. Where does focus land after dismissal?
