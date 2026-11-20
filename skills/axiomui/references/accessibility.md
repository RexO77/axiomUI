# Accessibility & inclusivity

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Keep keyboard focus visible (`a11y-1`)

Keep a visible indicator on keyboard focus. A custom focus treatment should remain identifiable across the surfaces and display modes where the control appears.

- Do: focus-visible:ring-2 ring-blue-500
- Don't: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

## Carry meaning beyond color (`a11y-2`)

When color communicates an error, state or category, add a second cue someone can perceive without distinguishing the hues. For a detected form error, identify the field and describe the problem in text.

- Do: Red text + error icon + message
- Don't: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

## Separate competing touch targets (`a11y-3`)

Leave space between nearby actions when an unintended tap would be costly. An 8px gutter protects the particular miss shown here. WCAG sets size and spacing tests rather than one minimum gap for every button.

- Do: Buttons: 8px gutter
- Don't: Buttons: 0px gutter
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

## Related rules in other domains

- `color-6` Give essential control edges enough contrast (`references/color.md`)
- `color-9` Accessible contrast ratios (`references/color.md`)
- `comp-12` Make overlay dismissal discoverable (`references/components.md`)
- `comp-13` Make the chart’s question answerable in text (`references/components.md`)
- `form-2` Keep field labels visible (`references/forms.md`)
- `form-13` Accept a complete sign-in code in one paste (`references/forms.md`)
- `sys-3` Size the hit area for the input (`references/system.md`)
- `sys-8` Follow the keyboard model for each control (`references/system.md`)
- `motion-2` Keep keyboard input responsive (`references/motion.md`)
- `motion-17` Preserve feedback with reduced motion (`references/motion.md`)
