# Keep scroll and focus targets clear of sticky headers

- ID: layout-12
- Category: Layout & spacing
- Tags: Accessibility, WCAG, Keyboard, Navigation
- URL: https://axiomui.nischal.fyi/rules/layout-12

Account for the height of sticky headers and footers in the scroll container. After an anchor jump or keyboard focus, the entire target should be visible.

- Do: scroll-padding-top: 64px
- Don't: scroll-padding-top: 0px

## Why it works

The Account settings header stays in place when you Tab to Work email. A 64px inset leaves the field and its focus ring visible below the header. An in-page link to a heading needs the same clearance.

- [WCAG 2.2 · Focus not obscured (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [WCAG technique C43 · scroll-padding](https://www.w3.org/WAI/WCAG22/Techniques/css/C43)

## What breaks

The Work email field can receive keystrokes while the header hides it. An anchor link can appear to land in the wrong section when its heading is covered.

## How to apply it

1. Search for sticky and fixed headers, then identify the scroll container they overlap. In DevTools, compare the focused element’s bounds with the header’s bottom edge.
2. Set scroll-padding-block-start on that container using the header’s rendered height. Include any space needed for the focus outline and account for a sticky footer at the block end.
3. Check the inset when the header wraps, switches at a breakpoint, or sits inside a nested scroller.

## Review questions

1. Scroll until the header sticks, open an in-page link to a heading, then Tab forward and Shift+Tab back through the nearby fields. Do the heading and each focus ring clear the header?
2. At 200% zoom, does the inset still match the header’s height?
3. Inside a scrollable panel, are targets clear of both the sticky header and footer?
