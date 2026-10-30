# Close affordance on overlays

- ID: comp-12
- Category: Components & actions
- Tags: Overlays, Keyboard, Accessibility
- URL: https://axiomui.nischal.fyi/rules/comp-12

Every modal, drawer, and popover needs a visible close button AND should close on backdrop click and Escape key.

- Do: X button + backdrop close + Esc key
- Don't: No close button, only backdrop click

## Why it works

Overlays trap users in a temporary context, so they need multiple redundant exits because different users reach for different habits: some hunt for an X button, others hit Escape, others click outside. Supporting the X button, backdrop click, and Escape key together respects all three mental models at once instead of forcing one.

## What breaks

A modal with no close button that only responds to backdrop clicks leaves keyboard-first and touch users stuck, unable to find any visible way out and forced to refresh the page to escape.

## How to apply it

1. Add a visible X button to every modal, drawer, and popover.
2. Wire backdrop click to close the overlay in addition to the X button.
3. Bind the Escape key to close the overlay as a third redundant exit.
4. Never ship an overlay relying on just one of these three close methods.

## Review questions

1. Is there a visible X button on this overlay?
2. Does clicking the backdrop close the overlay?
3. Does pressing Escape also close the overlay?
