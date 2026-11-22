# Give each typeface a job

- ID: typo-5
- Category: Typography & text
- Tags: System, Consistency
- URL: https://axiomui.nischal.fyi/rules/typo-5

Start with one font family for headings and body text. Add another for a specific use, such as code, display headings, or a script the first family lacks.

- Do: Inter for headings + body
- Don’t: Arial headings + Verdana body

## Why it works

The card’s heading is already larger and heavier than its description. Switching from Arial to Verdana adds little. A monospace font for code would signal a different kind of content.

- [Apple HIG · Typography](https://developer.apple.com/design/human-interface-guidelines/typography.md)
- [USWDS · Font families](https://designsystem.digital.gov/design-tokens/typesetting/font-family/)
- [CSS Fonts · Font matching](https://www.w3.org/TR/css-fonts-4/#font-matching-algorithm)
- [Microsoft Fluent 2 · Typography](https://fluent2.microsoft.design/typography)

## What breaks

Two body fonts can wrap the same text differently on neighboring screens. If a font lacks characters for a language, another font can appear mid-word.

## How to apply it

1. Name the role a new family will serve before adding it.
2. Check the heading and body together at their final sizes and widths.
3. Inspect fallback coverage in the languages your product supports.

## Before you ship

1. What job does the second font family do?
2. Could the existing family express the same distinction?
3. Which face actually renders the localized copy?
