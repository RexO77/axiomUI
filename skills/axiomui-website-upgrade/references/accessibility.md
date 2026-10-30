# Accessibility & inclusivity

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Focus visible indicators (`a11y-1`)

Never remove focus outlines (outline: none) without replacing them with a visible alternative. Keyboard users depend on them.

- Do: focus-visible:ring-2 ring-blue-500
- Don't: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

## Color shouldn't be the only signal (`a11y-2`)

Don't rely on color alone to convey meaning (red = error). Add icons, text, or patterns for colorblind users.

- Do: Red text + error icon + message
- Don't: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

## Touch target spacing (`a11y-3`)

Adjacent touch targets need at least 8px gap between them to prevent mis-taps on mobile.

- Do: Buttons: 8px gutter
- Don't: Buttons: 0px gutter
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

## Related rules in other domains

- `color-6` Double contrast for borders (`references/color.md`)
- `color-9` Accessible contrast ratios (`references/color.md`)
- `comp-12` Close affordance on overlays (`references/components.md`)
- `form-2` No placeholders as labels (`references/forms.md`)
- `sys-3` Click targets (Fitts's law) (`references/system.md`)
- `sys-8` Keyboard navigation (`references/system.md`)
- `motion-2` Keyboard actions stay instant (`references/motion.md`)
- `motion-17` Reduced motion still has intent (`references/motion.md`)
