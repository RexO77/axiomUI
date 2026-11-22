# Keep panel scrolling inside the panel

- ID: mobile-16
- Category: Mobile
- Tags: Scrolling, Overscroll
- URL: https://axiomui.nischal.fyi/rules/mobile-16

When an independent activity log reaches the end, a fresh swipe inside it should leave the underlying article at its reading position.

- Do: Swipe at log end · article holds position
- Don’t: Same swipe chains into the article

## Why it works

The activity log ends at Gates opened. Keeping a fresh swipe inside that log lets the reader pick up the article at the same sentence.

- [MDN, overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
- [W3C, CSS Overscroll Behavior Level 1](https://www.w3.org/TR/css-overscroll-1/)
- [Apple HIG, Scroll views](https://developer.apple.com/design/human-interface-guidelines/scroll-views)
- [Chrome, Take control of your scroll](https://developer.chrome.com/blog/overscroll-behavior)

## What breaks

A second swipe at the bottom of the log unexpectedly moves the article.

## How to apply it

1. iOS — Check Safari at both boundaries, including a log too short to scroll. Local bounce varies.
2. Android — Distinguish local overscroll feedback from moving the parent or triggering browser refresh.
3. Web — Set overscroll-behavior-y on the actual scrolling element. Modal focus, inertness and document scroll locking need separate handling.

## Before you ship

1. Swipe over Gates opened, then over the article text. Which scroll offset changes each time?
2. Does scrolling outside the log move the article?
3. What happens when the log is too short to scroll?
