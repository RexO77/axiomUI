# Transition only what changes

- ID: sys-13
- Category: System & logic
- Tags: Motion, CSS, Performance
- URL: https://axiomui.nischal.fyi/rules/sys-13

Never use transition: all. Specify the exact properties that should animate so unrelated style changes do not move unexpectedly.

- Do: transition-property: scale, background-color
- Don't: transition: all 150ms ease-out

## Why it works

Specifying transition-property explicitly, scale and background-color, ensures only intended properties animate, while transition: all animates every property that changes, including ones altered by unrelated state updates like a font load. This causes unexpected elements to visibly glide when they should snap instantly.

## What breaks

transition: all 150ms puts the late webfont on the same timeline as your hover state, so the Save changes button grows through two intermediate widths after the page has already settled. Nobody reads that as a font arriving; they read it as the layout coming apart.

## How to apply it

1. Replace transition: all with an explicit list such as transition-property: scale, background-color.
2. Audit each transitioning component for the exact properties that should animate.
3. Set explicit duration and easing per property group rather than one blanket rule.
4. Watch for unrelated properties, width, font, animating unintentionally during QA.

## Review questions

1. Does the CSS specify exact transition properties instead of transition: all?
2. Do unrelated style changes on the element happen instantly, without animating?
3. Does only the intended property, like scale or color, visibly animate on interaction?
