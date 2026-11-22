# Align a row icon with the first line of text

- ID: layout-6
- Category: Layout & spacing
- Tags: Alignment, Icons
- URL: https://axiomui.nischal.fyi/rules/layout-6

When an icon introduces a multiline notification, align it to the first line. Centering it in the whole text block moves it down as detail wraps. A single-line action can use centered alignment.

- Do: items-start + 1px top offset
- Don’t: items-center on the whole text block

## Why it works

The bell belongs beside “Backup complete”, even when the description wraps. In this row, aligning the bell to the top and moving it down 1px lines it up with the title.

- [Checkatrade · Inline banner](https://checkatrade.design/components/inline-banner/)
- [Chassis · Notification](https://chassis-ui.com/react/docs/components/notification/)
- [CSS Box Alignment · Aligning items](https://www.w3.org/TR/css-align-3/#align-items-property)
- [Apple · Create custom symbols](https://developer.apple.com/videos/play/wwdc2021/10250/)

## What breaks

Center the bell on the whole text block and it drops beside the description. With top alignment, check the space inside the SVG too. It affects where the bell appears.

## How to apply it

1. Find the line the icon belongs to, usually the title.
2. Anchor the icon to that first line, then inspect the artwork and font at their real sizes.
3. Test the row with a long description and larger text.

## Before you ship

1. Does the bell still sit beside the title after a wrap?
2. Does the artwork look aligned inside its SVG box?
3. Would the bell look centered beside a single line of text?
