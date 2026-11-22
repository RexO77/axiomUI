# State the chart’s main finding in words

- ID: comp-13
- Category: Components & actions
- Tags: Charts, Accessibility, Data visualization
- URL: https://axiomui.nischal.fyi/rules/comp-13

Name what the chart measures and summarize the main comparison. When exact values matter, make them available in a labeled table or another accessible format. Update both with the selected period.

- Do: Trend in words, monthly counts in the interactive example
- Don’t: Bars without a written summary or counts table

## Why it works

A support lead reviewing ticket volume has two questions. Which queue grew this quarter, and how many billing tickets arrived in March? A short trend sentence answers the first. A table with row and column headers lets the reader look up the second without estimating a bar’s height.

- [W3C WAI · Complex images](https://www.w3.org/WAI/tutorials/images/complex/)
- [USWDS · Data visualizations](https://designsystem.digital.gov/components/data-visualizations/)
- [EuroVis · Rich screen reader experiences for data visualization](https://vis.mit.edu/pubs/rich-screen-reader-vis-experiences/)
- [W3C WAI · Accessible data tables](https://www.w3.org/WAI/tutorials/tables/)

## What breaks

“Bar chart of monthly support tickets, Jan–Mar” identifies the graphic but omits its finding. A table left on January through March after the chart switches to April through June can give a precise answer for the wrong period.

## How to apply it

1. Write the question the chart should answer. Name the measure, period and series in its title or caption.
2. Summarize the meaningful change in words. Include structured values when the reader needs to look them up. A simple chart whose entire point fits in a sentence may need only that sentence.
3. Build the plot, summary and table from the same filtered data. Give data tables real headers and make the control that reveals them keyboard accessible.

## Before you ship

1. With the bars hidden, which queue grew over the selected period?
2. With January through March selected, can readers find March’s Billing count and tell it represents tickets?
3. After changing the quarter, do the plotted values, summary and table still agree?
