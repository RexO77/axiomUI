# Let people restore deleted items

- ID: sys-6
- Category: System & logic
- Tags: Safety, Error handling
- URL: https://axiomui.nischal.fyi/rules/sys-6

Offer Undo when an item moves to Trash. Keep it recoverable from Trash after the message closes. Ask for confirmation before a consequential deletion that cannot reliably be undone.

- Do: Moved to Trash with immediate Undo
- Don’t: Permanently deleted · no Undo

## Why it works

Undo helps someone who notices a deletion right away. Trash lets them restore the file later. Both depend on the server keeping the file and its sharing settings.

- [WCAG 2.2 · Error prevention (legal, financial, data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [W3C WAI · Recover deleted information](https://www.w3.org/WAI/WCAG22/Techniques/general/G99)
- [WCAG 2.2 · Timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
- [NN/g · Confirmation dialogs](https://www.nngroup.com/articles/confirmation-dialog/)
- [Flutter · Display a snackbar](https://docs.flutter.dev/cookbook/design/snackbars)
- [Apple Support · Delete files and folders on Mac](https://support.apple.com/guide/mac-help/delete-files-and-folders-on-mac-mchlp1093/mac)

## What breaks

A five-second notice as the only recovery route can expire before a keyboard or screen-reader user reaches it. Putting the row back on screen is misleading if the server has already deleted the file or its permissions.

## How to apply it

1. Decide how long Trash keeps the file and whether restoring it also restores its comments and sharing settings.
2. Make Undo reachable by keyboard and keep the item in Trash after the message closes.
3. Reserve a confirmation or review step for consequences that cannot be undone.

## Before you ship

1. Can the item be restored after the notice vanishes?
2. Do restored content and access match their prior state?
3. Does the user know when deletion becomes permanent?
