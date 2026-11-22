# Keep iPhone field text legible

- ID: mobile-20
- Category: Mobile
- Tags: Input size, Zoom
- URL: https://axiomui.nischal.fyi/rules/mobile-20

Small editable text can trigger focus zoom in iPhone Safari. Start the computed text size at 16 CSS px at default settings and keep user zoom available.

- Do: 16 px field · model stays at 100%
- Don’t: 14 px field · model crops to 114%

## Why it works

A legible postcode field lets the reader check the street and city while they type.

- [WebKit · Focused element scale calculation](https://raw.githubusercontent.com/WebKit/WebKit/77899089cc29f732abe2c258e19c970c0df364e3/Source/WebKit/UIProcess/API/ios/WKWebViewIOS.mm)
- [Apple, What's New in Safari 10](https://developer.apple.com/library/archive/releasenotes/General/WhatsNewInSafari/Articles/Safari_10_0.html)
- [W3C ACT, Meta viewport allows for zoom](https://www.w3.org/WAI/standards-guidelines/act/rules/b4f0c3/)
- [W3C, Understanding SC 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

## What breaks

Focusing a small field may zoom the page and move nearby controls out of view.

## How to apply it

1. iOS — This comparison concerns Safari’s focus heuristic. Use native text styles in UIKit and SwiftUI fields.
2. Android — Use native scalable text for Android fields. The iPhone focus heuristic establishes no Android size threshold.
3. Web — Check the computed field size, for example max(1rem, 16px). Keep pinch zoom enabled in both conditions.

## Before you ship

1. What is the field’s computed size before focus?
2. Does pinch zoom still work?
3. On an iPhone, what scale does Safari report before focus, after focus and after blur?
