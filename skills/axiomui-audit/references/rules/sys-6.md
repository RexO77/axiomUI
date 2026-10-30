# Undo destructive actions

- ID: sys-6
- Category: System & logic
- Tags: Safety, Error handling
- URL: https://axiomui.nischal.fyi/rules/sys-6

Prefer a few seconds of undo over a confirmation dialog. Undo costs nothing when the user meant it, and a dialog gets dismissed reflexively by everyone who did.

- Do: Deleted → Undo (5s)
- Don't: Deleted → gone, no undo

## Why it works

Loss aversion means users fear irreversible actions more than they warrant, so a five-second Undo window after Deleted converts a scary permanent action into a safely reversible one. Instant permanent deletion offers no recovery path and leans entirely on a confirmation dialog to prevent mistakes.

## What breaks

One stray click on the delete beside Q3-report.pdf takes the file with it, and the toast that follows reads permanently deleted, so the recovery path is a support ticket and whatever the last backup happens to hold.

## How to apply it

1. Show a Deleted, Undo (5s) toast immediately instead of a confirm-then-delete dialog.
2. Delay the actual destructive server call until the undo window closes.
3. Make the undo control large and easy to hit within the toast.
4. Reserve confirmation dialogs for actions too costly or complex to undo after the fact.

## Review questions

1. After deleting, does an Undo option appear for a few seconds before it is final?
2. Is the destructive action delayed on the server until the undo window passes?
3. Is the undo control easy to tap within the toast?
