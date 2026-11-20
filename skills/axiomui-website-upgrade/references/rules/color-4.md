# Make status colors dependable

- ID: color-4
- Category: Color & depth
- Tags: Semantics, States
- URL: https://axiomui.nischal.fyi/rules/color-4

Give status roles a consistent meaning in context and pair them with labels or recognizable symbols. A red heart can express affection. Reserve a distinct treatment for a destructive command shown beside it.

- Do: Like icon: blue-500
- Don't: Like icon: rose-500

## Why it works

The feed places Like and Delete next to one another. Keeping their symbols and wording distinct allows the team to choose a heart color suited to the product. If red is the strongest warning cue in this toolbar, spending it on both items weakens that local distinction.

- [WCAG 2.2 · Use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [Atlassian · Color roles](https://atlassian.design/foundations/color)

## What breaks

A reader who cannot distinguish the colors can lose the difference between two otherwise identical status marks. Recoloring an ambiguous control addresses only one part of the problem.

## How to apply it

1. Name the product’s status roles and specify the accompanying text or shape.
2. Check dangerous actions beside common actions in the same toolbar.
3. Review the task with color removed.

## Review questions

1. How does a reader identify the dangerous action?
2. Could the same accent describe different states within this row?
3. Which cue remains if the two hues look identical?
