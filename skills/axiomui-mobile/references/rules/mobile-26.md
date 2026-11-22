# Keep Undo clear of floating buttons

- ID: mobile-26
- Category: Mobile
- Tags: Undo, Hit areas
- URL: https://axiomui.nischal.fyi/rules/mobile-26

A two-line snackbar can place Undo underneath a floating Compose button. Lay them out together so both actions remain usable when the message wraps.

- Do: Undo clears Compose · message returns
- Don’t: Undo overlaps Compose · draft opens

## Why it works

The archive notice and the Compose button share the bottom edge of the inbox. Reserve the button’s height and a gap before placing the notice, including when its message wraps.

- [AndroidX, Material 3 Scaffold layout](https://raw.githubusercontent.com/androidx/androidx/cc19260e63cb6987f899a15feef625db9823b854/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Scaffold.kt)
- [Compose, Snackbar](https://developer.android.com/develop/ui/compose/components/snackbar)
- [Compose, FAB](https://developer.android.com/develop/ui/compose/components/fab)

## What breaks

A tap intended to restore the message opens a draft instead.

## How to apply it

1. iOS — Where the app uses a banner or action bar, check its entire hit area against other controls.
2. Android — Material 3 Scaffold coordinates the measured snackbar, floating action button and bottom bar.
3. Web — Reserve space from measured heights and insets. Test the longest translation and enlarged text.

## Before you ship

1. Does a tap in the center of Undo restore the message?
2. After Undo restores the message, can Compose still open a draft?
3. Does the translated two-line message clear both targets?
