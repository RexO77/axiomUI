# Show the main destinations

- ID: mobile-7
- Category: Mobile
- Tags: Tabs, Navigation
- URL: https://axiomui.nischal.fyi/rules/mobile-7

People can choose Orders directly when it is visible among the app’s peer destinations. Use short labels and give the current destination a recognizable state.

- Do: Orders visible · open it in one tap
- Don’t: Orders behind Menu · open it in two

## Why it works

A visible Orders tab gives the reader a destination to aim for on the first tap.

- [Nielsen Norman Group · Hamburger menus and hidden navigation](https://www.nngroup.com/articles/hamburger-menus/)
- [Apple HIG, Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Android, Navigation bar](https://developer.android.com/develop/ui/compose/components/navigation-bar)

## What breaks

From Home, hiding Orders adds a stop at Menu before the reader can see and choose Orders.

## How to apply it

1. iOS — Use labelled tabs for peer sections. Put an action such as Compose in the screen’s action controls.
2. Android — A Material navigation bar suits three to five peer destinations. Larger windows may use a rail.
3. Web — Use navigation links with stable URLs and aria-current. A visible row can work as well as a bottom bar.

## Before you ship

1. How many activations take you from Home to Orders?
2. Can you identify the current destination?
3. Does each peer destination retain its label?
