# Set line height for wrapped headings

- ID: typo-4
- Category: Typography & text
- Tags: Headings, Spacing
- URL: https://axiomui.nischal.fyi/rules/typo-4

Try tighter line spacing on a heading that wraps to two or three lines. Keep the lines close enough to read as one title, with room for accents in each script you support.

- Do: 22px / 24px (≈1.09×)
- Don’t: 22px / 33px (1.5×)

## Why it works

In the 22px heading, a 24px line height keeps the two lines close. At 33px they look farther apart. A font with taller accents may need that extra room.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/)
- [IBM Carbon · Type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets)
- [Material Design · Typography](https://m1.material.io/style/typography.html)
- [Adobe Spectrum · Typography system](https://spectrum.adobe.com/foundations/typography/typography-system)
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

## What breaks

A one-line mockup can hide collisions until a translated heading wraps. Too much line spacing can make its second line look like part of the paragraph below.

## How to apply it

1. Give headings their own line-height token when they need tighter spacing than paragraphs.
2. Try a long title with capitals, accents, and descenders.
3. Compare the space within the heading with the space between it and the body.

## Before you ship

1. Do both lines still read as one title?
2. Do accented capitals and descending marks clear adjacent lines?
3. When you enlarge the heading, do all its lines stay visible and clear of the paragraph below?
