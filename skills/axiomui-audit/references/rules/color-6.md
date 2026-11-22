# Give essential control edges at least 3:1 contrast

- ID: color-6
- Category: Color & depth
- Tags: Contrast, WCAG, Accessibility
- URL: https://axiomui.nischal.fyi/rules/color-6

If a border is how people recognize an enabled control, WCAG AA requires at least 3:1 contrast against the color beside it. Decorative dividers can be fainter. Check both themes.

- Do: Light mode · input border neutral-500 · divider neutral-200. Dark mode · input border neutral-400 · divider neutral-800
- Don’t: Light mode · input border neutral-100 · divider neutral-200. Dark mode · input border neutral-900 · divider neutral-800

## Why it works

The email field needs to look editable even before it has focus. If its border is the only cue, check for 3:1 against the background. Spacing already separates the sections, so their divider can be fainter. The Cancel label and its position beside Send invite help identify the button.

- [WCAG 2.2 · Contrast at control boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)
- [WCAG 2.2 · Non-text contrast criterion](https://www.w3.org/TR/WCAG22/#non-text-contrast)
- [GitHub Primer · Input border contrast](https://primer.style/accessibility/design-guidance/color-considerations/#input-border-contrast)
- [IBM Carbon · Text input specifications](https://www.carbondesignsystem.com/building-blocks/core/components/text-input/specifications)

## What breaks

With a faint border, the email address can look like ordinary text. A focus ring helps only after someone reaches the field.

## How to apply it

1. Before the field has focus, what identifies it as editable? Check its border, fill or underline.
2. Measure its contrast against the surrounding surface in each theme.
3. Hide each line in turn. If the groups are still clear, the divider can be faint. If people need the line to recognize a control or understand a graphic, check for at least 3:1 against the adjacent color.
4. Test focus and selected states separately from the resting control.

## Before you ship

1. Without the border, can a reader still find the field?
2. Does the feature that identifies the field reach 3:1 against its background?
3. Are focused and selected controls identifiable by their own cues?
