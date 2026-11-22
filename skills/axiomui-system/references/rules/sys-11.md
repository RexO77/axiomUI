# Keep the task usable at 320 CSS pixels

- ID: sys-11
- Category: System & logic
- Tags: Responsive, System, Mobile
- URL: https://axiomui.nischal.fyi/rules/sys-11

Set the viewport to 320 CSS pixels, or start at 1280px and zoom to 400%. Complete the main task without scrolling the page sideways. Let a table, map or code block scroll separately if its layout is essential.

- Do: 320px: fields stack · Continue in view
- Don’t: 320px: min-width 512px · Continue off-screen

## Why it works

At 400% zoom, a viewport that started at 1280 CSS pixels has 320 CSS pixels of layout width. Keeping Street and Postcode side by side forces a 512px row and pushes Continue off screen. Stacking the fields keeps it in view.

- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [W3C WAI · Using grid CSS to reflow columns](https://www.w3.org/WAI/WCAG22/Techniques/css/C32)
- [MDN · CSS overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow)
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [web.dev · Media queries](https://web.dev/learn/design/media-queries)

## What breaks

Someone reading at 400% scrolls left and right on every line and may never see the action. Hiding the overflow with `overflow-x: hidden` on the page removes the scrollbar but not the problem, so Continue becomes unreachable instead of hard to find.

## How to apply it

1. At 320 CSS pixels, check `document.documentElement.scrollWidth > document.documentElement.clientWidth`. Inspect fixed-width rows, `min-width` above 320px and labels that cannot wrap. Even if the widths match, check whether `overflow-x: hidden` clips a control. Remove viewport settings such as `user-scalable=no` or `maximum-scale=1` that can restrict mobile zoom.
2. Let content choose breakpoints: resize until something breaks, then prefer intrinsic fixes (wrapping, `minmax()` grids, container queries) before adding a device-sized query.
3. If a table, map or diagram needs two dimensions to make sense, give it a labeled scroll region people can use by keyboard. Let text wrap inside table cells and keep the rest of the page within the viewport.

## Before you ship

1. At 320 CSS pixels, does `document.documentElement.scrollWidth` equal the viewport width?
2. Zoom a 1280px viewport to 400% and complete the main task. Do you have to scroll the page sideways?
3. Which element sets the overflowing width, and does it need that width?
