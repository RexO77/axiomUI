# Anchor a row icon to the text it describes

- ID: layout-6
- Category: Layout & spacing
- Tags: Alignment, Icons
- URL: https://axiomui.nischal.fyi/rules/layout-6

When an icon introduces a multiline notification, align it to the first line. Centering it in the whole text block moves it down as detail wraps. A single-line action can use centered alignment.

- Do: items-start + 1px top offset
- Don't: items-center on the whole text block

## Why it works

The bell introduces “Backup complete”. Its location should remain stable when the supporting detail grows from one to three lines. Aligning the items at the start and tuning the bell against the title gives that relationship a fixed reference.

- [CSS Box Alignment · Aligning items](https://www.w3.org/TR/css-align-3/#align-items-property)
- [Apple · Create custom symbols](https://developer.apple.com/videos/play/wwdc2021/10250/)

## What breaks

Centering the bell across the entire group can leave it beside a continuation of the description. A top-aligned box can also look high if the icon artwork has unusual internal padding.

## How to apply it

1. Identify the line the glyph introduces.
2. Anchor the icon to that first line, then inspect the artwork and font at their real sizes.
3. Test the row with a long description and larger text.

## Review questions

1. Does the bell still sit beside the title after a wrap?
2. Does the artwork look aligned inside its SVG box?
3. Would a single-line version need a different treatment?
