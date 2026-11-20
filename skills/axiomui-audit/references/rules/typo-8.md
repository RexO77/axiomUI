# Align paragraphs to the reading start

- ID: typo-8
- Category: Typography & text
- Tags: Alignment, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-8

Give multiline prose a stable starting edge. For horizontal text, start alignment places English on the left and Arabic on the right. Reserve centering for short, self-contained passages that still work when they wrap.

- Do: Left-aligned paragraph text
- Don't: Centered multi-line paragraph

## Why it works

The changelog heading can sit in the center while its paragraph starts repeatedly at the same edge. As the measure narrows, centering gives each line a different starting point. Logical alignment preserves the intended edge when the paragraph changes direction.

- [GOV.UK · Text alignment](https://design-system.service.gov.uk/styles/font-override-classes/#text-alignment)

## What breaks

A two-word empty-state message can grow into a four-line instruction after translation. The centered composition that suited the short phrase now asks the reader to find a new starting point on each line.

## How to apply it

1. Use text-align: start for ordinary prose and set the correct language direction.
2. Review centered content with longer translations.
3. Check a narrow measure and enlarged text before making an exception.

## Review questions

1. Can the reader return to a consistent starting edge?
2. Does right-to-left text follow its own reading direction?
3. Is the centered treatment still suitable at its longest length?
