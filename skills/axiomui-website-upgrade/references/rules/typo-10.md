# Keep long filenames readable in tight rows

- ID: typo-10
- Category: Typography & text
- Tags: Wrapping, Responsive
- URL: https://axiomui.nischal.fyi/rules/typo-10

Let long text wrap when there’s room. If a filename must fit on one line, use an ellipsis to keep the size visible. Let people read the full name before choosing a file.

- Do: truncate (single-line ellipsis)
- Don’t: whitespace-nowrap (filename pushes the size out of view)

## Why it works

An ellipsis keeps the file size visible, but it can hide the version or extension that tells two files apart.

- [GitHub Primer · Truncation](https://primer.style/accessibility/patterns/truncation/)
- [CSS Overflow · Text overflow and ellipsis](https://www.w3.org/TR/css-overflow-3/#text-overflow)
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [MDN · Tooltip role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role)
- [CSS Flexbox · Automatic minimum size](https://www.w3.org/TR/css-flexbox-1/#min-size-auto)
- [WCAG 2.2 · Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)

## What breaks

A row of identically shortened filenames can make choosing a file guesswork. A hover-only title leaves people on touchscreens without a way to resolve the ambiguity.

## How to apply it

1. Try wrapping first for instructions and error messages.
2. Apply min-w-0 and truncate to the filename in its flex row.
3. Provide access to the full name through a details view or another keyboard- and touch-operable action.

## Before you ship

1. Can two files with the same prefix still be distinguished?
2. Can keyboard and touch users reveal the complete value?
3. At narrow widths, can you still see the file size?
