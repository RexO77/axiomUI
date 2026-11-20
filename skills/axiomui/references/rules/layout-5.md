# Size button padding around the label

- ID: layout-5
- Category: Layout & spacing
- Tags: Buttons, Spacing
- URL: https://axiomui.nischal.fyi/rules/layout-5

For a short text button, try more inline padding than block padding. Set the hit area, line height, and space for long labels separately from that visual proportion.

- Do: py-2 px-4 (ratio 2:1)
- Don't: py-2 px-2 (ratio 1:1)

## Why it works

With 8px block padding, the sample compares 8px and 16px at each side of the label. The second shape gives the word more lateral breathing room. Icon-only buttons, toolbar commands, and full-width actions answer different constraints.

- [USWDS · Buttons](https://designsystem.digital.gov/components/button/)
- [WCAG 2.2 · Target size (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## What breaks

A strict ratio can make a translated button exceed its container or allow a compact control to miss its target-size requirement. Measuring padding alone leaves out both the text and the clickable area.

## How to apply it

1. Use a button-size token that accounts for the line height.
2. Test the shortest and longest supported labels, including an optional icon.
3. Measure the actual target and spacing under the relevant accessibility requirement.

## Review questions

1. Does the label have enough space beside it?
2. Can the button wrap or grow when text enlarges?
3. How large is the area that actually responds?
