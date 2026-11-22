# Assign font weights by role

- ID: typo-9
- Category: Typography & text
- Tags: Hierarchy, Consistency
- URL: https://axiomui.nischal.fyi/rules/typo-9

In the settings card, semibold marks the heading and action. Regular works for the description. Add another weight only if readers can see what it distinguishes at that size.

- Do: Regular + Semibold
- Don’t: Regular + Medium + Semibold + Bold

## Why it works

With four weights in the digest card, “12 recipients” is bolder than “Weekly digest”. Giving the count regular weight lets the title and action stand out.

- [IBM Carbon · Type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets)
- [Microsoft Fluent 2 · Typography](https://fluent2.microsoft.design/typography)
- [Adobe Spectrum · Typography system](https://spectrum.adobe.com/foundations/typography/typography-system)
- [MDN · Font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight)

## What breaks

A bold recipient count can look like a heading, while “Edit schedule” can look like body text. If the font lacks a requested weight, two roles may look alike.

## How to apply it

1. Map weights to roles such as heading, body, and emphasis.
2. Compare those roles together using the loaded font at actual size.
3. If two weights look alike, distinguish the roles with size or spacing.

## Before you ship

1. Which text should the reader encounter first?
2. Does incidental metadata compete with the heading?
3. Do adjacent weights remain distinct in the loaded font?
