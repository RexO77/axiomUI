# Keep scroll and focus targets clear of sticky headers

- ID: layout-12
- Category: Layout & spacing
- Tags: Accessibility, WCAG, Keyboard, Navigation
- URL: https://axiomui.nischal.fyi/rules/layout-12

Set scroll padding to clear sticky headers and footers. Follow an in-page link or press Tab and check that the whole target is visible.

- Do: scroll-padding-top: 64px
- Don’t: scroll-padding-top: 0px

## Why it works

With a 64px scroll inset, the focused “Work email” field and its outline sit below the 64px “Account settings” header. An in-page link to a heading needs the same clearance.

- [WCAG 2.2 · Focus not obscured (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html)
- [WCAG technique C43 · scroll-padding](https://www.w3.org/WAI/WCAG22/Techniques/css/C43)
- [CSS Scroll Snap · Scroll padding](https://www.w3.org/TR/css-scroll-snap-1/#scroll-padding)
- [WCAG 2.2 · Focus not obscured (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [CSS-Tricks · Fixed headers and on-page links](https://css-tricks.com/fixed-headers-on-page-links-and-overlapping-content-oh-my/)
- [WCAG 2.2 · Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)

## What breaks

The Work email field can receive keystrokes while the header hides it. An anchor link can appear to land in the wrong section when its heading is covered.

## How to apply it

1. Search for sticky and fixed headers, then identify the scroll container they overlap. In DevTools, compare the focused element’s bounds with the header’s bottom edge.
2. Set scroll-padding-block-start to the header’s rendered height, plus room for an outside focus outline. For a sticky footer, set scroll-padding-block-end too.
3. Check the inset when the header wraps, switches at a breakpoint, or sits inside a nested scroller.

## Before you ship

1. Scroll until the header sticks, open an in-page link to a heading, then Tab forward and Shift+Tab back through the nearby fields. Do the heading and each focus ring clear the header?
2. At 200% zoom, does the inset still match the header’s height?
3. Inside a scrollable panel, are targets clear of both the sticky header and footer?
