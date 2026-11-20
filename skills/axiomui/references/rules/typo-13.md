# Review wrapping in short descriptions

- ID: typo-13
- Category: Typography & text
- Tags: Wrapping, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-13

Try text-wrap: pretty on a caption or card description with an awkward ending. Browsers choose the details of the wrapping algorithm, so judge the result on the engines you support.

- Do: p.description { text-wrap: pretty }
- Don't: p.description { text-wrap: wrap }

## Why it works

The example fixes the card measure and changes one CSS property. Some engines primarily rebalance the final lines, while others consider breaks earlier in the paragraph. The value requests better wrapping and leaves the exact line breaks to the browser.

- [WebKit · Better typography with text-wrap: pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)
- [CSS Text · Wrapping styles](https://www.w3.org/TR/css-text-4/#text-wrap-style)

## What breaks

If a card depends on a particular word moving to its last line, a change of font, translation, or browser can expose clipping. The problem belongs to the card height if an extra line would hide content.

## How to apply it

1. Let the card grow with its text.
2. Compare pretty with ordinary wrapping at the card widths the grid produces.
3. Review captions in more than one engine before declaring the final line fixed.

## Review questions

1. Does the closing phrase read naturally?
2. Can the description gain a line without losing its action?
3. Does ordinary wrapping still give a usable result?
