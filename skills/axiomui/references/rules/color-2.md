# Use the intended text color

- ID: color-2
- Category: Color & depth
- Tags: Contrast, Readability
- URL: https://axiomui.nischal.fyi/rules/color-2

Choose an ink color for each theme and check it against its surface. Black and near-black can both give excellent contrast on white. Reuse the chosen text token so adjacent screens follow the same palette.

- Do: #0f172a on #ffffff (17.9:1)
- Don't: #000000 on #ffffff (21:1)

## Why it works

On the white card, #0f172a measures about 17.9:1 and black measures 21:1. Both exceed the enhanced threshold for ordinary text. The difference the example demonstrates is whether the card follows its chosen ink color. Neither measurement predicts an individual reader’s comfort.

- [WCAG 2.2 · Contrast (enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)

## What breaks

A hard-coded color can look fine in a single light-theme card, then disappear when its surface switches to a darker theme. A search-and-replace that removes all black can also defeat a deliberately high-contrast palette.

## How to apply it

1. Define semantic text and surface tokens together.
2. Measure the rendered pair in each supported theme.
3. Respect the reader’s contrast settings and check the UI when system colors take over.

## Review questions

1. Does the card use the expected text role?
2. What ratio does the pair produce on this surface?
3. Do important details remain visible in increased-contrast settings?
