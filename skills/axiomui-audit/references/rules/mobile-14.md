# Expose actions hidden behind gestures

- ID: mobile-14
- Category: Mobile
- Tags: Context menus, Discoverability
- URL: https://axiomui.nischal.fyi/rules/mobile-14

Someone looking at a photo cannot see a long press. Give actions hidden behind a press or swipe a visible, named way in.

- Do: More opens Share, Favorite and Delete
- Don’t: Same three actions require a long press

## Why it works

A visible menu lets a reader discover an action without first knowing a gesture.

- [Apple HIG, Providing context menu actions](https://developer.apple.com/design/human-interface-guidelines/context-menus)
- [Apple HIG, Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)
- [Apple HIG, Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [MDN, -webkit-touch-callout](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-touch-callout)

## What breaks

A reader can tap the photo, find no actions and leave without adding it to favorites. A swipe-only Archive action has the same discovery problem.

## How to apply it

1. iOS — Expose context-menu items through the main interface too. Keep ordinary link previews available elsewhere.
2. Android — Offer an accessible overflow menu or selection control for actions reachable by a long press.
3. Web — Use a real button with an accessible name and keyboard-operable menu. Scope any custom callout suppression to the affected item.

## Before you ship

1. Can someone add the photo to favorites through More, then return to the same photo?
2. Does scrolling cancel a pending long press?
3. Can a keyboard reach and dismiss the same actions?
