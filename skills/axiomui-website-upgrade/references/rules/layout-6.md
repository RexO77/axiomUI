# Optical alignment of icons

- ID: layout-6
- Category: Layout & spacing
- Tags: Alignment, Icons
- URL: https://axiomui.nischal.fyi/rules/layout-6

Align an icon beside text to the cap height of that text, not to the full line box. The line box includes the leading above and below the letters, so centering on it drops the icon visually low.

- Do: items-start (icon on the cap height)
- Don't: items-center (icon on the line box)

## Why it works

Line height includes leading above and below the letterforms, but an icon carries no leading of its own, so centering it against full line height sits it a few pixels lower than the text’s cap height. Aligning to cap height instead matches where the letters’ visual mass actually starts.

## What breaks

Flex-center an icon against a label with generous line-height and the icon appears to float slightly below the text, a mismatch obvious in any icon-plus-label button or nav item once you look for it.

## How to apply it

1. Align icons to the text’s cap height, not the full line-height box.
2. Don’t assume flex-center, align-items: center, is correct by default — it fails when line-height runs large relative to font size.
3. Check alignment visually against the top of capital letters, not against computed heights.
4. Adjust with a small negative margin or transform when auto-centering falls short.

## Review questions

1. Does the icon’s optical center line up with the cap height of the adjacent text?
2. Does the icon look like it’s sitting slightly low or high relative to the label?
3. Was the alignment verified by eye rather than trusting flex-center alone?
