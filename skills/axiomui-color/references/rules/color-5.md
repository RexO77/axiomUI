# Keep decorative dividers quiet

- ID: color-5
- Category: Color & depth
- Tags: Contrast, Surfaces
- URL: https://axiomui.nischal.fyi/rules/color-5

Use a subdued border when it only separates rows that already read as distinct. If a line is necessary to identify a control or understand a graphic, give it adequate contrast for that role.

- Do: border: neutral-200
- Don't: border: neutral-400

## Why it works

The settings summary already positions a label and value on each row. Its rules can be subtle because removing them leaves the rows identifiable. An otherwise unmarked text field has a different job for its outline.

- [WCAG 2.2 · Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

## What breaks

Treating all borders as decorative can make inputs disappear. Treating every divider like a control edge can make a dense table look dominated by its grid.

## How to apply it

1. Remove the line temporarily and identify which information disappears with it.
2. Use a decorative token for redundant separators.
3. For essential components or graphical boundaries, measure contrast with the adjacent colors.

## Review questions

1. Can a reader still pair each label with its value?
2. Is this boundary decorative or required to locate something?
3. Do changes in surface color alter that answer?
