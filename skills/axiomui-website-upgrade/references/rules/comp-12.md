# Make overlay dismissal discoverable

- ID: comp-12
- Category: Components & actions
- Tags: Overlays, Keyboard, Accessibility
- URL: https://axiomui.nischal.fyi/rules/comp-12

Give dismissible dialogs a visible Close or Cancel action and support Escape. Choose outside-click behavior according to the cost of an accidental dismissal.

- Do: X button + backdrop close + Esc key
- Don't: No close button, only backdrop click

## Why it works

The shortcuts sheet in the example contains reference material. Closing it loses nothing, so outside-click dismissal is convenient. An editor containing an unsaved draft needs a decision about saving or discarding the work, regardless of how dismissal starts.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## What breaks

A backdrop-only exit leaves no obvious control to focus. Closing on every outside tap can create the opposite problem when a slight miss discards edits.

## How to apply it

1. Include a labeled dismissal control in the dialog’s tab sequence.
2. Make Escape act on the topmost dismissible overlay and return focus to a logical place.
3. Route all dismissal paths through the same unsaved-work handling.

## Review questions

1. Can a keyboard user discover how to leave?
2. What happens to an unsaved edit after Escape or a backdrop click?
3. Where does focus land after dismissal?
