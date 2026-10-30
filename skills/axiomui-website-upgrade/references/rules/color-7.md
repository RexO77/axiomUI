# Hover = same hue

- ID: color-7
- Category: Color & depth
- Tags: Hover, States, Consistency
- URL: https://axiomui.nischal.fyi/rules/color-7

Hover and active states should stay in the same hue and only move lightness or saturation. A hue shift reads as a different element, not as the same element responding.

- Do: blue-600 → blue-700
- Don't: blue-600 → green-600

## Why it works

Shifting hue on hover, like blue to green, forces the brain to re-identify the color category entirely, while stepping blue-600 to blue-700 only changes lightness within a category already recognized. Staying within one hue keeps the interaction legible as the same element deepening, not a different colored object appearing.

## What breaks

A button that shifts from blue to green on hover reads as a state change — like a status flipping to success — rather than a hover effect, confusing users about whether an action already completed.

## How to apply it

1. Step hover states within the same hue, e.g. blue-600 to blue-700.
2. Never cross into a different color family like blue to green on interaction.
3. Adjust only lightness or saturation for hover/active/pressed states.
4. Check every interactive color transition for accidental hue shifts.

## Review questions

1. Does the hover color stay in the same hue family as the resting state?
2. Could the hover state be mistaken for a status change like success?
3. Is only the lightness/saturation shifting on interaction, not the hue?
