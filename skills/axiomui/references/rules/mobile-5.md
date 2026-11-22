# Let a scroll cancel a press

- ID: mobile-5
- Category: Mobile
- Tags: Touch input, Cancellation
- URL: https://axiomui.nischal.fyi/rules/mobile-5

An inbox row should acknowledge contact before it knows whether the person wants to open it or scroll. Opening on touch-down spends that choice too soon.

- Do: Scroll from row 4 · inbox stays open
- Don’t: Scroll from row 4 · message opens on contact

## Why it works

Contact is the start of both a tap and a scroll. Waiting for release lets the scroll view cancel activation.

- [WWDC18, Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/)
- [W3C, Understanding SC 2.5.2](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)
- [Android platform · Touch slop configuration](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/core/res/res/values/config.xml)
- [Compose, Handling interactions](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/handling-interactions)

## What breaks

Dragging up from a message row opens the message before the inbox can scroll.

## How to apply it

1. iOS — Use the control’s highlighted state and normal activation event. Let the scroll view resolve the movement.
2. Android — Use the Material press indication and distinguish press, cancellation and completed click.
3. Web — Use click for activation. Clear custom pressed visuals on cancellation, and preserve ordinary panning and keyboard activation.

## Before you ship

1. Start a scroll on Tide tables. Does the inbox move, or does the message open under your finger?
2. Does a canceled press clear its highlight?
3. Does a completed tap open exactly once?
