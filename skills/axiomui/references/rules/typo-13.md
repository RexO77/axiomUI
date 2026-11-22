# Avoid a lone last word in short descriptions

- ID: typo-13
- Category: Typography & text
- Tags: Wrapping, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-13

If a caption or card description leaves one word alone on the last line, try text-wrap: pretty. Check where the line breaks in each browser you support.

- Do: text-wrap: pretty
- Don’t: text-wrap: wrap

## Why it works

At 23ch, ordinary wrapping can leave “work.” alone on the last line. With text-wrap: pretty, “your work.” can stay together. The exact break depends on the browser.

- [CSS Text · Wrapping styles](https://www.w3.org/TR/css-text-4/#text-wrap-style)
- [WebKit · Better typography with text-wrap pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)
- [Chrome for Developers · CSS text-wrap: pretty](https://developer.chrome.com/blog/css-text-wrap-pretty)
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## What breaks

A translation, font change, or different browser can add a line. If the card has a fixed height, the last line may be clipped.

## How to apply it

1. Let the card grow with its text.
2. Compare pretty with ordinary wrapping at the card widths the grid produces.
3. Check the last line in each browser you support.

## Before you ship

1. Does the closing phrase read naturally?
2. Can the description gain a line without clipping anything in the card?
3. Does ordinary wrapping still give a usable result?
