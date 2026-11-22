# Keep the caret above the keyboard

- ID: mobile-21
- Category: Mobile
- Tags: Keyboard insets, Viewport
- URL: https://axiomui.nischal.fyi/rules/mobile-21

A message composer anchored to the layout viewport can sit behind the keyboard. While the reader types, keep the caret and Send within the visible editing area.

- Do: Keyboard starts at y=508 · Send ends there
- Don’t: Send ends at y=844 behind the keyboard

## Why it works

The visible editing rectangle may shrink or move while the layout viewport keeps its height.

- [Chrome · Keyboard resize policies](https://developer.chrome.com/blog/viewport-resize-behavior)
- [MDN, Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [CSS Viewport (WD)](https://www.w3.org/TR/css-viewport-1/#interactive-widget-section)
- [Apple HIG, Virtual keyboards](https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards)
- [Emil Kowalski, Building a drawer component](https://emilkowal.ski/ui/building-a-drawer-component)

## What breaks

The draft still receives text while the caret and Send button sit behind the software keyboard.

## How to apply it

1. iOS — Use the keyboard layout guide in native layouts. Check the undocked and external keyboard cases independently.
2. Android — Use IME insets in native layouts. Verify the browser and WebView separately when choosing a resize policy.
3. Web — Start with a scrollable form. A pinned shell can follow top-level visualViewport height and offset, or reflow when a supported resizes-content policy is active.

## Before you ship

1. Can you see the last line while typing?
2. Can you tap Send while the keyboard is open and see your last line arrive in the conversation?
3. Does the composer return when a hardware keyboard is used?
