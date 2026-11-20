# Keep secondary text legible

- ID: typo-6
- Category: Typography & text
- Tags: Hierarchy, Contrast
- URL: https://axiomui.nischal.fyi/rules/typo-6

Give secondary text a quieter role through position, weight, size, or tone. Keep ordinary informative text at 4.5:1 or higher against its background for WCAG AA.

- Do: text-neutral-500 (14px)
- Don't: text-neutral-900 (10px)

## Why it works

The email in the member row is secondary to the name, yet it can be the detail that distinguishes two people. A 14px muted email can support that decision. Both reducing the size and reducing the contrast affect whether the address can be read.

- [WCAG 2.2 · Contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## What breaks

The two sample rows vary size and color together. Passing a contrast check cannot tell you whether the smaller address is easy to distinguish, and a comfortable type size cannot rescue insufficient contrast.

## How to apply it

1. Start with the address at a readable size, then reduce its emphasis one property at a time.
2. Measure the final text and surface pair in both themes.
3. Try two people with the same display name and different addresses.

## Review questions

1. Can a reader distinguish the people by their addresses?
2. Does the muted text meet the applicable contrast threshold?
3. Does the intended order survive zoom and theme changes?
