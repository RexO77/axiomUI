# Keep the task usable at 320 CSS pixels

- ID: sys-11
- Category: System & logic
- Tags: Responsive, System, Mobile
- URL: https://axiomui.nischal.fyi/rules/sys-11

Narrow the viewport to 320 CSS pixels, or zoom a 1280px window to 400%, and complete the page’s main task. Content should reflow without sideways scrolling. A wide table, map or code block may scroll inside its own region.

- Do: 320px: fields stack · Continue in view
- Don't: 320px: min-width 512px · Continue off-screen

## Why it works

A 1280px window zoomed to 400% lays out like a 320 CSS px phone, so the people who enlarge text get the narrowest layout there is. In the example, one row keeps Street and Postcode side by side with a 512px minimum. The page then scrolls sideways and Continue sits past the right edge.

- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [web.dev · Media queries](https://web.dev/learn/design/media-queries)

## What breaks

Someone reading at 400% scrolls left and right on every line and may never see the action. Hiding the overflow with `overflow-x: hidden` on the page removes the scrollbar but not the problem, so Continue becomes unreachable instead of hard to find.

## How to apply it

1. Find it: at 320 CSS px run `document.documentElement.scrollWidth > window.innerWidth` in the console, then inspect the widest element. In code, search for `min-width` above 320px, fixed widths on rows, `whitespace-nowrap` on long labels, and `overflow-x: hidden` on html or body. A viewport tag with `user-scalable=no` or `maximum-scale=1` blocks the zoom this test simulates, so remove it.
2. Let content choose breakpoints: resize until something breaks, then prefer intrinsic fixes (wrapping, `minmax()` grids, container queries) before adding a device-sized query.
3. Two-dimensional content is excepted. Give a data table, map or diagram its own scroll region with a visible scrollbar, a label and keyboard access (`tabindex="0"`), and keep the rest of the page in one column.

## Review questions

1. At 320 CSS px, does `document.documentElement.scrollWidth` equal the viewport width?
2. Zoom a 1280px window to 400% and complete the main task. Did any step need sideways scrolling?
3. Which element sets the overflowing width, and does it need that width?
