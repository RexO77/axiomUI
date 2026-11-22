# Make the last sheet option reachable

- ID: mobile-18
- Category: Mobile
- Tags: Sheets, Overflow
- URL: https://axiomui.nischal.fyi/rules/mobile-18

A sheet has a maximum height. Once it reaches that height, its list still needs a scroll range if options extend below the window.

- Do: Expand, scroll and select option 12
- Don’t: Expand · option 12 remains clipped

## Why it works

An expanded sheet can still be shorter than its contents. Its body needs enough scroll range to bring the last option into view.

- [Android Compose, Partial bottom sheet](https://developer.android.com/develop/ui/compose/components/bottom-sheets-partial)
- [Material, BottomSheetBehavior](https://developer.android.com/reference/com/google/android/material/bottomsheet/BottomSheetBehavior)
- [UIKit, Sheet detents](https://developer.apple.com/documentation/uikit/uisheetpresentationcontroller/detents)
- [W3C APG, Modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## What breaks

Wheelchair access is option 12. Expanding the sheet exposes more rows, but its last option stays below the bottom edge until the body can scroll.

## How to apply it

1. iOS — Use available detents and keep a tappable way to expand or close the sheet.
2. Android — Partially expanded and expanded states depend on available space. Give the expanded content an actual scroll range.
3. Web — Keep modal focus inside the sheet. Use a bounded, scrollable body and return focus to the opener.

## Before you ship

1. Can you select Wheelchair access after expanding?
2. Can you reach and select the final row with Tab as well as by scrolling?
3. Where does focus return after Close?
