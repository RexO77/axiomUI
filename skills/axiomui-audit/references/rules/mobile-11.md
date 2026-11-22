# Fit navigation to the window

- ID: mobile-11
- Category: Mobile
- Tags: Navigation, Window size
- URL: https://axiomui.nischal.fyi/rules/mobile-11

An unfolded phone or tablet can give an app a narrow window. Switch navigation surfaces according to the available space while keeping the same places and selection.

- Do: 390 dp split window · bottom bar
- Don’t: Same window · rail sized for 700 dp device

## Why it works

The space available to an app can change while the physical display stays the same.

- [Android Developers · Build adaptive navigation](https://developer.android.com/develop/adaptive-apps/guides/build-adaptive-navigation)
- [Android, Window size classes](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes)
- [Compose, Navigation bar](https://developer.android.com/develop/ui/compose/components/navigation-bar)
- [SwiftUI, sidebarAdaptable](https://developer.apple.com/documentation/swiftui/tabviewstyle/sidebaradaptable)

## What breaks

A rail sized for the full display takes a column away from the saved book when the app shares the screen.

## How to apply it

1. iOS — Allow tabs or a sidebar to adapt to the scene’s available space.
2. Android — The documented navigation suite uses a bar for compact width, compact height or tabletop posture. Test all three conditions.
3. Web — Measure the viewport or container and choose the break where these links fit. Preserve each link’s address.

## Before you ship

1. Which surface appears at 599 and 600 dp?
2. Does compact height change that decision?
3. Does Saved remain selected through the resize?
