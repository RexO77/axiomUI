---
name: axiomui-accessibility
description: Axiom UI's accessibility rules plus the related rules from other domains, with Do/Don't values and reasoning. Use when checking focus-visible indicators, color-independent status signals, touch target size and spacing, contrast for text and borders, keyboard navigation and instant keyboard actions, labels instead of placeholders, overlay close affordances, or reduced-motion behavior, and when reviewing UI for WCAG issues.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Accessibility & inclusivity

Accessibility is not a separate layer added at the end. It is the same interface held to a floor you can measure. This skill gathers Axiom UI's accessibility rules together with the related rules from color, components, forms, system and motion, so one pass covers focus, contrast, target size, keyboard paths, labels and reduced motion. Verify with a keyboard and a contrast checker, not by reading the code.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Apply its Do as written. Values are targets, not suggestions.
3. Check the result against its Don't. Code that matches the Don't is a violation, whatever the intent behind it.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Focus visible indicators (`a11y-1`)

Never remove focus outlines (outline: none) without replacing them with a visible alternative. Keyboard users depend on them.

- Do: focus-visible:ring-2 ring-blue-500
- Don't: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

### Color shouldn't be the only signal (`a11y-2`)

Don't rely on color alone to convey meaning (red = error). Add icons, text, or patterns for colorblind users.

- Do: Red text + error icon + message
- Don't: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

### Touch target spacing (`a11y-3`)

Adjacent touch targets need at least 8px gap between them to prevent mis-taps on mobile.

- Do: Buttons: 8px gutter
- Don't: Buttons: 0px gutter
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

## Cross-listed from other domains

These rules are filed under other domains but decide accessibility outcomes. Hold them to the same floor.

### Double contrast for borders (`color-6`)

An interactive edge needs more contrast than a passive divider, so inputs and outline buttons should sit a step darker. A border has to be found before it can be clicked.

- From: Color & depth
- Do: input border: neutral-300 · divider: neutral-200
- Don't: input border: neutral-100 · divider: neutral-200
- Reasoning: `references/rules/color-6.md` · https://axiomui.nischal.fyi/rules/color-6

### Accessible contrast ratios (`color-9`)

Text must meet WCAG AA contrast (4.5:1 for body, 3:1 for large text). Don't eyeball it — check it.

- From: Color & depth
- Do: #737373 on #ffffff (4.7:1)
- Don't: #aaaaaa on #ffffff (2.3:1)
- Reasoning: `references/rules/color-9.md` · https://axiomui.nischal.fyi/rules/color-9

### Close affordance on overlays (`comp-12`)

Every modal, drawer, and popover needs a visible close button AND should close on backdrop click and Escape key.

- From: Components & actions
- Do: X button + backdrop close + Esc key
- Don't: No close button, only backdrop click
- Reasoning: `references/rules/comp-12.md` · https://axiomui.nischal.fyi/rules/comp-12

### No placeholders as labels (`form-2`)

Placeholders disappear when you type. Users forget what the field was. Use persistent labels.

- From: Forms & inputs
- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

### Click targets (Fitts's law) (`sys-3`)

Interactive elements need at least a 44x44px hit area. Acquisition time rises as a target shrinks (Fitts's law), and a fingertip covers roughly 8mm of glass however small the icon is.

- From: System & logic
- Do: 44x44px hit area
- Don't: 16x16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Keyboard navigation (`sys-8`)

All interactive elements must be reachable via Tab, activatable via Enter/Space, and dismissible via Escape.

- From: System & logic
- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

### Keyboard actions stay instant (`motion-2`)

Keyboard-driven actions are repeated constantly. Do not animate shortcuts, command palettes, or focus movement in ways that delay the result.

- From: Motion & interaction
- Do: Keyboard panel: 0ms
- Don't: Keyboard panel: 240ms
- Reasoning: `references/rules/motion-2.md` · https://axiomui.nischal.fyi/rules/motion-2

### Reduced motion still has intent (`motion-17`)

Reduced motion should remove movement while preserving helpful feedback through opacity, color, or immediate state changes.

- From: Motion & interaction
- Do: Reduced motion: fade in place
- Don't: Reduced motion: slides anyway
- Reasoning: `references/rules/motion-17.md` · https://axiomui.nischal.fyi/rules/motion-17

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
