# Keep each tab’s place

- ID: mobile-8
- Category: Mobile
- Tags: Tabs, State restoration
- URL: https://axiomui.nischal.fyi/rules/mobile-8

A person who checks their bag halfway through reading a product should return to the same product and passage when they switch back.

- Do: Shop → Bag → Shop restores product 18
- Don’t: Shop → Bag → Shop resets to catalog

## Why it works

Each tab can preserve its own route and reading anchor while another tab is active.

- [Apple HIG, Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Android Developers · Support multiple back stacks](https://developer.android.com/guide/navigation/backstack/multi-back-stacks)
- [Android, Navigation bar](https://developer.android.com/develop/ui/compose/components/navigation-bar)
- [SwiftUI, sidebarAdaptable](https://developer.apple.com/documentation/swiftui/tabviewstyle/sidebaradaptable)

## What breaks

If switching tabs remounts Shop at its root, returning from Bag lands the reader in the catalog. They have to find the atlas and its returns policy again.

## How to apply it

1. iOS — Keep the selected destination and its navigation state. Treat reselecting the active tab as a separate interaction.
2. Android — Save and restore independent navigation stacks for peer flows. Also restore the list or detail scroll state.
3. Web — Store a route and reading anchor per destination and restore after content layout. Preserve browser history behavior.

## Before you ship

1. Does Shop reopen product 18?
2. Is the Returns passage visible again?
3. What happens if the text size changes while you are away?
