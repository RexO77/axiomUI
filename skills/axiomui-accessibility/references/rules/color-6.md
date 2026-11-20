# Give essential control edges enough contrast

- ID: color-6
- Category: Color & depth
- Tags: Contrast, WCAG, Accessibility
- URL: https://axiomui.nischal.fyi/rules/color-6

When a boundary is needed to identify an enabled control, WCAG AA requires at least 3:1 contrast against its adjacent color. A decorative divider may be quieter. Check the actual pair in each theme.

- Do: input border: neutral-500 · divider: neutral-200
- Don't: input border: neutral-100 · divider: neutral-200

## Why it works

The blank area where a teammate’s address goes needs to look editable before anyone reaches it. On white, a pale gray input edge can look stronger than a divider and still miss 3:1. The action labeled Cancel may be identifiable from its content and context without a visible border.

- [WCAG 2.2 · Contrast at control boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)

## What breaks

Reusing a decorative divider token for a field can leave the reader with a label and an apparently blank page. Making only its focused outline visible helps keyboard navigation after focus arrives and leaves the resting field hard to find.

## How to apply it

1. Identify which visual feature makes the resting input recognizable.
2. Measure that feature against its adjacent surface, including themed variants.
3. Test focus and selected states separately from the resting control.

## Review questions

1. Without the border, can a reader still find the field?
2. Does the required cue reach 3:1 on the adjacent surface?
3. Are focused and selected controls identifiable by their own cues?
