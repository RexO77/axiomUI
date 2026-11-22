# Close the sheet before leaving

- ID: mobile-9
- Category: Mobile
- Tags: Sheets, Back
- URL: https://axiomui.nischal.fyi/rules/mobile-9

When a sheet has its own navigation state, Back should dismiss that layer and reveal the page the person was using. Give the sheet a visible exit as well.

- Do: Back closes café details · map pin stays
- Don’t: Back leaves the map with details open

## Why it works

The map and its selected pin supply the context for café details. Closing one layer preserves that context.

- [Nielsen Norman Group · Bottom sheets](https://www.nngroup.com/articles/bottom-sheet/)
- [Apple HIG, Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Apple HIG, Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

## What breaks

Back removes the map while the details sheet is still open.

## How to apply it

1. iOS — Use a visible Cancel or Close and native sheet dismissal. Guard unsaved work according to the task.
2. Android — Let the topmost modal sheet consume a completed system Back before the parent route.
3. Web — Where a sheet is represented in history, handle Back, Forward and explicit close consistently. Escape and Close restore focus.

## Before you ship

1. Does Back dismiss the top sheet first?
2. Does focus return to the selected pin?
3. After an explicit Close, does Back leave the map and Forward restore the right layer? Try a direct link as well.
