# Destructive actions

- ID: comp-2
- Category: Components & actions
- Tags: Buttons, Safety
- URL: https://axiomui.nischal.fyi/rules/comp-2

Keep Delete secondary. For permanent deletes, confirm in a modal with a red button; when the delete can be undone, skip the modal and offer an undo toast instead.

- Do: Secondary “Delete project…” → red confirm
- Don't: Red “Delete” in the row, no confirm

## Why it works

A giant red button sitting in the main UI primes users for loss aversion anxiety on every glance, yet its constant visibility also breeds habituation, so the warning eventually stops registering. Splitting the action into a neutral gray trigger and a red confirm step puts the alarm exactly once, at the moment it can prevent a mistake.

## What breaks

A prominent red Delete button next to routine controls gets hit by muscle memory or a stray tap, and without a confirm step the destructive action fires immediately, destroying data with no recovery path.

## How to apply it

1. Style the initial trigger as a secondary Delete… button, matching the surrounding secondary actions.
2. Move the red styling exclusively to the confirming Delete button inside the modal.
3. Never let the red state appear anywhere outside the confirmation step.
4. Name what will be lost in the modal — this can’t be undone is the line that earns the extra click.
5. Scope the confirm to permanent deletions. Where the delete can be reversed, keep the secondary trigger and swap the modal for an undo window, which protects the same mistake without asking a question first.

## Review questions

1. Is the initial Delete… trigger styled as a secondary action rather than red?
2. For a permanent delete, does clicking it open a confirmation step before anything is removed?
3. Is red reserved for the confirming button inside the modal?
