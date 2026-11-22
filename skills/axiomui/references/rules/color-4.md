# Use status colors consistently

- ID: color-4
- Category: Color & depth
- Tags: Semantics, States
- URL: https://axiomui.nischal.fyi/rules/color-4

Pair each status color with a label or recognizable symbol. If red marks Delete, give the Like heart beside it a different color.

- Do: Like icon · blue-500 in light mode, blue-400 in dark mode
- Don’t: Like icon · rose-500 in light mode, rose-400 in dark mode

## Why it works

The heart identifies Like. The trash icon and Delete label identify the destructive action. A blue heart leaves Delete as the only red action in the row.

- [WCAG 2.2 · Use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [Atlassian · Color roles](https://atlassian.design/foundations/color)
- [GOV.UK · Warning buttons](https://design-system.service.gov.uk/components/button/)
- [Psychological Research · Implicit color–valence associations](https://pmc.ncbi.nlm.nih.gov/articles/PMC10017663/)

## What breaks

When two status indicators differ only in color, people who cannot distinguish the hues may mistake one status for the other. Give each a label or distinct shape.

## How to apply it

1. List each status and the label or symbol that identifies it.
2. Check rows where destructive actions sit beside everyday ones.
3. Review the task with color removed.

## Before you ship

1. How does a reader identify the dangerous action?
2. Does one color mean two things in this row?
3. Which cue remains if the two hues look identical?
