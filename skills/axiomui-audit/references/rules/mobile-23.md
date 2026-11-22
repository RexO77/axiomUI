# Let rows grow with enlarged text

- ID: mobile-23
- Category: Mobile
- Tags: Text size, Wrapping
- URL: https://axiomui.nischal.fyi/rules/mobile-23

A label can scale correctly and still lose its last words inside a fixed-height row. Let the label wrap and the row grow enough to complete the task.

- Do: At 200% the full payment label fits
- Don’t: At 200% a 56 dp row clips it

## Why it works

A minimum row height leaves room for the line boxes a larger label needs.

- [Apple HIG, Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Android 14.0.0 r1 · Font scale conversion table](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-14.0.0_r1/core/java/android/content/res/FontScaleConverterFactory.java)
- [W3C, Understanding SC 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

## What breaks

The last words of a payment option disappear inside its fixed row.

## How to apply it

1. iOS — Test a large accessibility size. Stack secondary information when inline text no longer fits.
2. Android — Use a minimum row height and the platform’s sp conversion for text and line height.
3. Web — Allow wrapping and intrinsic height. Test 200% text resize and the separate 320 CSS px reflow check in sys-11.

## Before you ship

1. Is the full business-account label readable at 200%?
2. Can you still select the wrapped option?
3. At 200% in the Android 14 fixture, do the 34 dp lines fit inside the payment row?
