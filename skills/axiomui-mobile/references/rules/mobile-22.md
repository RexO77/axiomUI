# Follow the reader’s text size

- ID: mobile-22
- Category: Mobile
- Tags: Text size, Dynamic Type
- URL: https://axiomui.nischal.fyi/rules/mobile-22

A reader who enlarges text in Settings should see it change where the task happens. First check whether the text responds. Then test whether the enlarged layout still works.

- Do: Change Body to AX5 · sample grows
- Don’t: Change Body to AX5 · sample stays fixed

## Why it works

A reader who uses enlarged text needs the pickup instructions to grow when they change the setting.

- [WebKit, Using the System Font in Web Content](https://webkit.org/blog/3709/using-the-system-font-in-web-content/)
- [Apple HIG, Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [WWDC24 · Get started with Dynamic Type](https://developer.apple.com/videos/play/wwdc2024/10074/)
- [Android 14, font scaling](https://developer.android.com/about/versions/14/features)

## What breaks

Fixed text stays small even though the reader changed the system setting.

## How to apply it

1. iOS — Use Dynamic Type styles or scale custom fonts with UIFontMetrics. Test an accessibility size.
2. Android — Use sp for text and line height. Android 14 introduced nonlinear scaling up to 200%.
3. Web — Respect browser text resize and zoom. In Safari, test -apple-system-body where an OS-linked text style is intended. Relative sizes alone do not prove OS integration.

## Before you ship

1. Does the actual label respond to a larger setting?
2. In the iOS fixture, does Body grow from 17 pt to 53 pt at AX5?
3. Does the platform’s text conversion apply to line height too?
