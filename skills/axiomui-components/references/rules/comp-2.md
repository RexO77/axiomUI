# Confirm irreversible deletion

- ID: comp-2
- Category: Components & actions
- Tags: Buttons, Safety
- URL: https://axiomui.nischal.fyi/rules/comp-2

Match the safeguard to the loss. Let people recover a reversible removal. Before permanent deletion, identify what will disappear and ask for an explicit decision.

- Do: Secondary “Delete project…” → red confirm
- Don't: Red “Delete” in the row, no confirm

## Why it works

“Delete project” can mean removing a shortcut, sending a project to Trash, or erasing a shared workspace for everyone. Two red buttons can conceal three very different consequences. Name the object, scope and recovery path where the decision is made.

- [WCAG 2.2 · Error prevention (legal, financial, data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## What breaks

Someone who only meant to clean up their own sidebar could erase files their team still uses. A generic “Are you sure?” gives them little reason to reconsider.

## How to apply it

1. Distinguish leaving a project from deleting it for everyone.
2. Name the affected project and whether recovery is possible in the confirmation.
3. Offer an explicit Cancel action and consider initial focus on the least destructive choice.

## Review questions

1. Whose data changes?
2. Could the confirmation be mistaken for a harmless removal?
3. Can someone back out using only the keyboard?
