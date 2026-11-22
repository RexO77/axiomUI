# Keep hover distinct from success

- ID: color-7
- Category: Color & depth
- Tags: Hover, States, Consistency
- URL: https://axiomui.nischal.fyi/rules/color-7

If green signals success, keep the button blue on hover. A darker blue shows that the pointer is over it.

- Do: blue-600 → blue-700
- Don’t: blue-600 → green-600

## Why it works

The blue button darkens when the pointer moves over it. If green signals success elsewhere, turning the button green on hover can make it look as though the action already happened.

- [IBM Carbon · Interaction states](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview)
- [Atlassian · Color roles](https://atlassian.design/foundations/color)
- [WCAG 2.2 · Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [MDN · Hover media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover)

## What breaks

If hover alone makes a button look selected or complete, a person can misread the state before acting. A touch user may never see a hover cue at all.

## How to apply it

1. Define resting, hover, pressed, focus, and completed states separately.
2. Inspect the label and icon contrast through each state.
3. Check that people can find and use the button with a touchscreen or keyboard.

## Before you ship

1. What does the color change communicate here?
2. Can you tell when the action has succeeded and when the pointer is just hovering?
3. Can the control be found before hover occurs?
