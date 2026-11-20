# Accessibility & inclusivity checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Keep keyboard focus visible (`a11y-1`)

- Do: focus-visible:ring-2 ring-blue-500 · Don't: outline: none with no replacement
- [ ] Can someone locate focus throughout the keyboard path?
- [ ] Is the indicator distinguishable wherever it is drawn?
- [ ] Does it remain visible under zoom, clipping and forced colors?
- Reasoning: `references/rules/a11y-1.md`

## Carry meaning beyond color (`a11y-2`)

- Do: Red text + error icon + message · Don't: Only a red border on the input
- [ ] Can someone tell the two states apart without their hues?
- [ ] Does the message explain what needs correcting?
- [ ] Does the nonvisual presentation carry the same meaning?
- Reasoning: `references/rules/a11y-2.md`

## Separate competing touch targets (`a11y-3`)

- Do: Buttons: 8px gutter · Don't: Buttons: 0px gutter
- [ ] Where does a near miss land?
- [ ] Do expanded hit areas overlap?
- [ ] Is the protection appropriate to the cost of choosing the wrong action?
- Reasoning: `references/rules/a11y-3.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `color-6` Give essential control edges enough contrast (`references/checklists/color.md`)
- `color-9` Accessible contrast ratios (`references/checklists/color.md`)
- `comp-12` Make overlay dismissal discoverable (`references/checklists/components.md`)
- `comp-13` Make the chart’s question answerable in text (`references/checklists/components.md`)
- `form-2` Keep field labels visible (`references/checklists/forms.md`)
- `form-13` Accept a complete sign-in code in one paste (`references/checklists/forms.md`)
- `sys-3` Size the hit area for the input (`references/checklists/system.md`)
- `sys-8` Follow the keyboard model for each control (`references/checklists/system.md`)
- `motion-2` Keep keyboard input responsive (`references/checklists/motion.md`)
- `motion-17` Preserve feedback with reduced motion (`references/checklists/motion.md`)
