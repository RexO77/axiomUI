# Make the chart’s question answerable in text

- ID: comp-13
- Category: Components & actions
- Tags: Charts, Accessibility, Data visualization
- URL: https://axiomui.nischal.fyi/rules/comp-13

Identify what the chart shows and describe the comparison readers need. When the task calls for individual values, offer them in a labeled table or another accessible representation that follows the selected period.

- Do: Summarize the trend and offer the monthly counts
- Don't: Leave the trend and counts in the bars alone

## Why it works

A support lead reviewing ticket volume has two questions. Which queue grew this quarter, and how many billing tickets arrived in March? A short trend sentence answers the first. A table with row and column headers lets the reader look up the second without estimating a bar’s height.

- [W3C WAI · Complex images](https://www.w3.org/WAI/tutorials/images/complex/)
- [USWDS · Data visualizations](https://designsystem.digital.gov/components/data-visualizations/)

## What breaks

“Bar chart of support tickets” identifies the graphic but omits its finding. A table left on January through March after the chart switches to April through June can give a precise answer for the wrong period.

## How to apply it

1. Write the question the chart should answer. Name the measure, time period and series where the reader encounters the chart.
2. Summarize the meaningful change in words. Include structured values when the reader needs to look them up. A simple chart whose entire point fits in a sentence may need only that sentence.
3. Build the plot, summary and table from the same filtered data. Give data tables real headers and make the control that reveals them keyboard accessible.

## Review questions

1. With the bars hidden, which queue grew over the selected period?
2. Can a reader find March’s billing count and identify its unit using the table headers?
3. After changing the quarter, do the plotted values, summary and table still agree?
