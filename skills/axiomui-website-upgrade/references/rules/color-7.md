# Keep hover feedback distinct from a result

- ID: color-7
- Category: Color & depth
- Tags: Hover, States, Consistency
- URL: https://axiomui.nischal.fyi/rules/color-7

A hover treatment should communicate availability without implying the operation has completed. A darker shade of the button’s existing color works when green is reserved nearby for success.

- Do: blue-600 → blue-700
- Don't: blue-600 → green-600

## Why it works

Hover changes what the pointer is over. It does not submit the form. In the example a blue button deepens on hover. Turning it green could resemble the confirmation treatment used after a successful action. In another system a deliberate hue change may be a recognizable brand interaction.

- [Atlassian · Color roles](https://atlassian.design/foundations/color)
- [WCAG 2.2 · Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

## What breaks

If hover alone makes a button look selected or complete, a person can misread the state before acting. A touch user may never see a hover cue at all.

## How to apply it

1. Define resting, hover, pressed, focus, and completed states separately.
2. Inspect the label and icon contrast through each state.
3. Ensure the action can be identified and operated with touch and keyboard.

## Review questions

1. What does the color change communicate here?
2. Is completion still distinct from hovering?
3. Can the control be found before hover occurs?
