# Limit the width of long paragraphs

- ID: layout-2
- Category: Layout & spacing
- Tags: Readability, Responsive
- URL: https://axiomui.nischal.fyi/rules/layout-2

On wide screens, start with about 65 characters per line for English paragraphs. Count a few full lines. In CSS, 1ch is the width of the font's zero.

- Do: max-width: 52ch
- Don’t: width: 100%

## Why it works

The sample page is 95ch wide. Its 52ch text column fits about 60 to 65 characters per full line in SF Pro or Inter, depending on the words.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/)
- [CSS Values · Font-relative lengths](https://www.w3.org/TR/css-values-4/#ch)
- [USWDS · Measure (line length)](https://designsystem.digital.gov/design-tokens/typesetting/measure/)
- [Visible Language · Line length and reading from screen](https://distantreader.org/stacks/journals-ojs/vl/vl-5671.pdf)
- [WCAG 2.2 · Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## What breaks

When a paragraph spans a wide dashboard, readers can lose their place between lines. A fixed minimum width can force them to scroll sideways when they zoom in.

## How to apply it

1. Set a maximum inline size on the article text while allowing the column to shrink.
2. Count characters on a few full lines of real copy.
3. Review translated text and the largest supported text size.

## Before you ship

1. On a wide screen, do full lines of English text stay near 65 characters?
2. Can the column shrink to fit a narrow viewport?
3. Do tables and figures have the width their content needs?
