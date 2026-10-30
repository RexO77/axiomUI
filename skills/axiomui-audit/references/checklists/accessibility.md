# Accessibility & inclusivity checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## Focus visible indicators (`a11y-1`)

- Do: focus-visible:ring-2 ring-blue-500 · Don't: outline: none with no replacement
- [ ] Does tabbing show a visible ring on every element that takes focus?
- [ ] Is outline: none ever applied without a replacement in the same rule?
- [ ] Does a mouse click stay ring-free while Tab shows the ring?
- Reasoning: `references/rules/a11y-1.md`

## Color shouldn't be the only signal (`a11y-2`)

- Do: Red text + error icon + message · Don't: Only a red border on the input
- [ ] Does every flagged input carry an icon and a message, not only a color change?
- [ ] In grayscale, can you still tell which field has the error?
- [ ] Does the message name the actual problem rather than only marking the field?
- Reasoning: `references/rules/a11y-2.md`

## Touch target spacing (`a11y-3`)

- Do: Buttons: 8px gutter · Don't: Buttons: 0px gutter
- [ ] Is there at least 8px between the hit areas of adjacent buttons, not only between their visible edges?
- [ ] Do any buttons in a row or toolbar touch edge-to-edge?
- [ ] On a real touchscreen, can you tap one button without brushing its neighbour?
- Reasoning: `references/rules/a11y-3.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `color-6` Double contrast for borders (`references/checklists/color.md`)
- `color-9` Accessible contrast ratios (`references/checklists/color.md`)
- `comp-12` Close affordance on overlays (`references/checklists/components.md`)
- `form-2` No placeholders as labels (`references/checklists/forms.md`)
- `sys-3` Click targets (Fitts's law) (`references/checklists/system.md`)
- `sys-8` Keyboard navigation (`references/checklists/system.md`)
- `motion-2` Keyboard actions stay instant (`references/checklists/motion.md`)
- `motion-17` Reduced motion still has intent (`references/checklists/motion.md`)
