# Balance short headings

- ID: typo-12
- Category: Typography & text
- Tags: Wrapping, Headings
- URL: https://axiomui.nischal.fyi/rules/typo-12

Try balanced wrapping when a short multiline heading ends with an isolated word. Read the resulting phrases at several widths before making it the heading default.

- Do: h1, h2, h3 { text-wrap: balance }
- Don't: h1, h2, h3 { text-wrap: wrap }

## Why it works

The 19ch sample lets the browser choose two more even lines. The same setting on a different heading may move a name, number, or modifier away from the words it belongs with. Line shapes and meaning both deserve a check.

- [CSS Text · Wrapping styles](https://www.w3.org/TR/css-text-4/#text-wrap-style)

## What breaks

Hard-coded breaks fitted to one title can fragment a translation or waste an entire line on a smaller screen. A balanced arrangement can also look awkward when its break cuts across a phrase.

## How to apply it

1. Compare natural and balanced breaks in the actual heading width.
2. Review short, long, and translated headings.
3. Keep natural wrapping when it already preserves the phrase.

## Review questions

1. Does the title read naturally across the break?
2. How does the longest translated heading wrap?
3. Does the layout still work with ordinary wrapping?
