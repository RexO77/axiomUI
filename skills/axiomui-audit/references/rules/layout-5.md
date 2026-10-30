# Button padding formula

- ID: layout-5
- Category: Layout & spacing
- Tags: Buttons, Spacing
- URL: https://axiomui.nischal.fyi/rules/layout-5

Horizontal padding should be roughly 1.5x to 2x the vertical padding. Text runs sideways, so equal padding on all four sides leaves a label crowded against the left and right edges.

- Do: py-2 px-4 (ratio 2:1)
- Don't: py-2 px-2 (ratio 1:1)

## Why it works

Text is wider than it is tall, so equal padding on both axes, like py-2 px-2, leaves a button that reads as visually square and cramped around its label. Keeping horizontal padding at 1.5x to 2x vertical, such as py-2 px-4 (8px / 16px), restores a proportion that matches the text’s own shape.

## What breaks

Apply py-2 px-2 to a text button and the label crowds both edges evenly while vertical space looks generous by comparison, giving the button a squat, tile-like shape instead of one that reads as clickable.

## How to apply it

1. Default to py-2 px-4, 8px vertical and 16px horizontal.
2. Keep horizontal padding between 1.5x and 2x the vertical value for any text button.
3. Never apply equal padding, like py-2 px-2, to a button containing a text label.
4. Reserve equal padding for icon-only buttons, where the content is symmetric.

## Review questions

1. Is the horizontal padding noticeably larger than the vertical padding on this button?
2. Does the button look square or cramped rather than proportioned around its label?
3. Do icon-only buttons use different, equal padding compared to text buttons?
