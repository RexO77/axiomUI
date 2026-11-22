# Align paragraphs to their starting edge

- ID: typo-8
- Category: Typography & text
- Tags: Alignment, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-8

Start each line of a paragraph at the same edge, left in English and right in Arabic. If you center a short passage, check how it reads when it wraps.

- Do: Left-aligned paragraph text
- Don’t: Centered paragraph

## Why it works

The changelog heading stays centered in both examples. In the left-aligned paragraph, each line starts at the guide. In the centered paragraph, the starting point changes with the line length.

- [GOV.UK · Text alignment](https://design-system.service.gov.uk/styles/font-override-classes/#text-alignment)
- [ONS Service Manual · Accessible text formatting](https://service-manual.ons.gov.uk/brand-guidelines/typography/accessible-text-formatting)
- [CSS Text · Text alignment](https://www.w3.org/TR/css-text-3/#text-align-property)
- [Microsoft Fluent 2 · Typography](https://fluent2.microsoft.design/typography)

## What breaks

A two-word message can grow to four lines in translation. If it’s centered, the reader has to find the start of each line again.

## How to apply it

1. Set the paragraph’s direction with dir when needed. Use text-align: start to align it to that edge.
2. Review centered content with longer translations.
3. Before centering a passage, read it in a narrow column and with enlarged text.

## Before you ship

1. Can the reader return to a consistent starting edge?
2. Does right-to-left text follow its own reading direction?
3. Is the centered text still easy to read in its longest translation?
