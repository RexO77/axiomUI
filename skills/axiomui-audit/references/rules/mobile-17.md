# Keep list flicks from dismissing sheets

- ID: mobile-17
- Category: Mobile
- Tags: Sheets, Scrolling
- URL: https://axiomui.nischal.fyi/rules/mobile-17

In a long sheet, a fast flick can bring the list back to the top. Let that gesture finish before a fresh drag from the top can dismiss the sheet.

- Do: List flick ends at top · sheet stays
- Don’t: Same list flick reaches top and dismisses

## Why it works

Remembering where a drag began gives a list flick one job until release.

- [Emil Kowalski, Building a drawer component](https://emilkowal.ski/ui/building-a-drawer-component)
- [Apple HIG, Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [Android Material, BottomSheetBehavior](https://developer.android.com/reference/com/google/android/material/bottomsheet/BottomSheetBehavior)

## What breaks

A traveller flicks back from departure 25 to check the first train. If the sheet takes over at the top, the timetable disappears before they can read it.

## How to apply it

1. iOS — Use native scroll and sheet coordination. Check the content and the grabber separately.
2. Android — Use the nested-scrolling child and the sheet’s state to decide who receives a drag.
3. Web — For a custom sheet, remember which surface owned the gesture at its start. Provide a Close button and avoid binding dismissal to every downward move.

## Before you ship

1. After a flick from departure 25, can you read the first departure without reopening the sheet?
2. Is the sheet still open when the list reaches the top?
3. Can a fresh pull from the top dismiss it?
