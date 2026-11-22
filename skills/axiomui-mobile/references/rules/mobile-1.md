# Keep controls inside the safe area

- ID: mobile-1
- Category: Mobile
- Tags: Safe area, Touch targets
- URL: https://axiomui.nischal.fyi/rules/mobile-1

The background of a checkout bar can reach the glass. Its Pay button needs room on the usable side of the system bar, including its ordinary padding when the inset is zero.

- Do: Pay ends 12 px above the safe boundary
- Don’t: 22 px of Pay overlaps the 34 px inset

## Why it works

The background can fill the bottom of the screen while the button sits higher. Adding the inset to the design gap keeps that gap when the inset changes.

- [Apple HIG, Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [WebKit, Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [WWDC21, Design for Safari 15](https://developer.apple.com/videos/play/wwdc2021/10029/)
- [Android, Window insets](https://developer.android.com/develop/ui/compose/system/insets)
- [Android, Edge-to-edge design](https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge)
- [MDN, env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)

## What breaks

Pay ends at 832 in an 844-unit screen. With a 34-unit bottom inset, the last 22 units of the button fall inside the system region.

## How to apply it

1. iOS — Anchor the foreground to the safe-area layout guide and let the bar background extend beneath it.
2. Android — Read window insets for the current navigation mode. With Material 3 Scaffold, apply and consume the supplied content padding once.
3. Web — For a full-bleed viewport, add the affected env(safe-area-inset-*) value to the design gap.

## Before you ship

1. Does Pay keep its ordinary padding at zero inset?
2. After rotation, does the whole target clear the cutout?
3. Is Scaffold padding consumed exactly once?
