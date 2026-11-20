# Preserve meaning when text overflows

- ID: typo-10
- Category: Typography & text
- Tags: Wrapping, Responsive
- URL: https://axiomui.nischal.fyi/rules/typo-10

Let meaningful text wrap when space permits. In a compact row, an ellipsis can protect neighboring controls if the reader can still obtain the full value before acting.

- Do: truncate (single-line ellipsis)
- Don't: overflow-visible, no truncation

## Why it works

A file list must accommodate a long name and a size column in the same row. Ellipsis preserves the column boundary while indicating omitted text. The omitted part may include the version or extension that distinguishes two files.

- [CSS Overflow · Text overflow and ellipsis](https://www.w3.org/TR/css-overflow-3/#text-overflow)
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## What breaks

A row of identically shortened filenames can make choosing a file guesswork. A hover-only title leaves people on touchscreens without a way to resolve the ambiguity.

## How to apply it

1. Try wrapping first for instructions and error messages.
2. For a single-line filename, give its flex item room to shrink and apply the truncate utility.
3. Provide access to the full name through a details view or another keyboard- and touch-operable action.

## Review questions

1. Can two files with the same prefix still be distinguished?
2. Can keyboard and touch users reveal the complete value?
3. Do the size and actions stay accessible at narrow widths?
