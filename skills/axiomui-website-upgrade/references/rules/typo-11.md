# Choose a readable body size

- ID: typo-11
- Category: Typography & text
- Tags: Readability, Mobile
- URL: https://axiomui.nischal.fyi/rules/typo-11

Start body text around 16px. Adjust for the font, the task, and how far away the screen is. Leave room for essential details to wrap when someone enlarges the text.

- Do: 16px message · 12px details
- Don’t: 11px message · 9px details

## Why it works

The time and location help you recognize the sign-in. Check that the 12px details are legible alongside the 16px message. Fonts with taller lowercase letters can look larger at the same size.

- [USWDS · Typography](https://designsystem.digital.gov/components/typography/)
- [WCAG 2.2 · Resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [USWDS · Typesetting and optical size](https://designsystem.digital.gov/design-tokens/typesetting/overview/)
- [Legge and Bigelow · Does print size matter for reading?](https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/)
- [Rello et al. · Make It Big! (CHI 2016)](https://pielot.org/pubs/Rello2016-Fontsize.pdf)

## What breaks

The 11px alert has 9px text for the time and place, the details that help identify the sign-in. A fixed-height row can clip those details when someone enlarges the text.

## How to apply it

1. Set the body text size in a relative unit such as rem.
2. Try the smallest supporting text using the actual content on a representative device.
3. Check enlargement to 200% and allow the row to grow.

## Before you ship

1. Can you read the time and location well enough to recognize the sign-in?
2. At 200% enlargement, are all details and actions available?
3. Could moving or wrapping a detail recover space?
