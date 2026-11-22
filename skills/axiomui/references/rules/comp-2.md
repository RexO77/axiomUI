# Confirm irreversible deletion

- ID: comp-2
- Category: Components & actions
- Tags: Buttons, Safety
- URL: https://axiomui.nischal.fyi/rules/comp-2

Offer Undo or a way to restore the item. Before permanent deletion, name what people will lose and ask them to confirm.

- Do: “Delete project…” opens a confirmation naming atlas-api
- Don’t: “Delete” removes the project immediately

## Why it works

“Delete project” could remove a shortcut, move a project to Trash or erase it for the whole team. Before someone confirms, say which project they’ll lose, who’s affected and whether they can restore it.

- [IBM Carbon · Delete and remove actions](https://v10.carbondesignsystem.com/patterns/common-actions/#delete)
- [WCAG 2.2 · Error prevention (legal, financial, data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [Apple HIG · Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- [Fluent · Destructive confirmation dialogs](https://fluent2.microsoft.design/components/web/react/core/dialog/usage/)
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## What breaks

Someone who only meant to clean up their own sidebar could erase files their team still uses. A generic “Are you sure?” gives them little reason to reconsider.

## How to apply it

1. Distinguish leaving a project from deleting it for everyone.
2. Name the affected project and whether recovery is possible in the confirmation.
3. Include a Cancel button. For permanent deletion, give it initial focus so an accidental Enter cancels.

## Before you ship

1. Whose data changes?
2. Could the confirmation be mistaken for a harmless removal?
3. Can someone back out using only the keyboard?
