# Balance short headings

- ID: typo-12
- Category: Typography & text
- Tags: Wrapping, Headings
- URL: https://axiomui.nischal.fyi/rules/typo-12

If a short heading leaves one word alone on its last line, try text-wrap: balance. Read the heading at several widths to check where phrases break.

- Do: text-wrap: balance
- Don’t: text-wrap: wrap

## Why it works

In the 19ch heading, ordinary wrapping can leave “project” alone. Balanced wrapping gives the two lines more even lengths. Check that a break still keeps names and phrases together.

- [CSS Text · Wrapping styles](https://www.w3.org/TR/css-text-4/#text-wrap-style)
- [Chrome for Developers · CSS text-wrap: balance](https://developer.chrome.com/docs/css-ui/css-text-wrap-balance)
- [WebKit · Better typography with text-wrap pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)
- [MDN · Text wrap styles](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap-style)

## What breaks

Hard-coded breaks fitted to one title can fragment a translation or waste an entire line on a smaller screen. A balanced arrangement can also look awkward when its break cuts across a phrase.

## How to apply it

1. Compare natural and balanced breaks in the actual heading width.
2. Review short, long, and translated headings.
3. Keep natural wrapping when it already preserves the phrase.

## Before you ship

1. Does the title read naturally across the break?
2. How does the longest translated heading wrap?
3. Does the layout still work with ordinary wrapping?
