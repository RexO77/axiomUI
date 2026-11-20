---
name: axiomui-accessibility
description: Use Axiom UI’s accessibility guidance to check keyboard focus and operation, target size and spacing, text and control contrast, meaning beyond color, field labels, accessible authentication, chart alternatives, modal dismissal and reduced motion. Consult the sources on the linked rule page when checking a conformance claim.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Accessibility & inclusivity

Follow a task with the input method or presentation the rule addresses. Try a sign-in code from the clipboard, navigate a chart’s data table by its headers, or enlarge text until the layout reflows. For a WCAG finding, identify the applicable success criterion, its level and exceptions, and record what happened on the tested path.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test the failure the comparison illustrates. For a standard, verify the applicable requirement and its exceptions. For a design convention, judge the outcome with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Keep keyboard focus visible (`a11y-1`)

Keep a visible indicator on keyboard focus. A custom focus treatment should remain identifiable across the surfaces and display modes where the control appears.

- Do: focus-visible:ring-2 ring-blue-500
- Don't: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

### Carry meaning beyond color (`a11y-2`)

When color communicates an error, state or category, add a second cue someone can perceive without distinguishing the hues. For a detected form error, identify the field and describe the problem in text.

- Do: Red text + error icon + message
- Don't: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

### Separate competing touch targets (`a11y-3`)

Leave space between nearby actions when an unintended tap would be costly. An 8px gutter protects the particular miss shown here. WCAG sets size and spacing tests rather than one minimum gap for every button.

- Do: Buttons: 8px gutter
- Don't: Buttons: 0px gutter
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

## Cross-listed from other domains

These rules cover specific accessibility decisions in other domains. Check the conditions and exceptions in each rule before making a conformance finding.

### Give essential control edges enough contrast (`color-6`)

When a boundary is needed to identify an enabled control, WCAG AA requires at least 3:1 contrast against its adjacent color. A decorative divider may be quieter. Check the actual pair in each theme.

- From: Color & depth
- Do: input border: neutral-500 · divider: neutral-200
- Don't: input border: neutral-100 · divider: neutral-200
- Reasoning: `references/rules/color-6.md` · https://axiomui.nischal.fyi/rules/color-6

### Accessible contrast ratios (`color-9`)

For WCAG AA, ordinary text needs at least 4.5:1 contrast. Large text qualifies at 3:1. Measure unrounded values against the actual background, including overlays and images behind the text.

- From: Color & depth
- Do: #737373 on #ffffff (4.7:1)
- Don't: #aaaaaa on #ffffff (2.3:1)
- Reasoning: `references/rules/color-9.md` · https://axiomui.nischal.fyi/rules/color-9

### Make overlay dismissal discoverable (`comp-12`)

Give dismissible dialogs a visible Close or Cancel action and support Escape. Choose outside-click behavior according to the cost of an accidental dismissal.

- From: Components & actions
- Do: X button + backdrop close + Esc key
- Don't: No close button, only backdrop click
- Reasoning: `references/rules/comp-12.md` · https://axiomui.nischal.fyi/rules/comp-12

### Make the chart’s question answerable in text (`comp-13`)

Identify what the chart shows and describe the comparison readers need. When the task calls for individual values, offer them in a labeled table or another accessible representation that follows the selected period.

- From: Components & actions
- Do: Summarize the trend and offer the monthly counts
- Don't: Leave the trend and counts in the bars alone
- Reasoning: `references/rules/comp-13.md` · https://axiomui.nischal.fyi/rules/comp-13

### Keep field labels visible (`form-2`)

Keep a visible label after typing or autofill. A placeholder can illustrate an entry, but it disappears precisely when someone needs to review the completed form.

- From: Forms & inputs
- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

### Accept a complete sign-in code in one paste (`form-13`)

Let people paste a one-time code as they receive it. Keep leading zeros and support autofill where available. A design with separate boxes can still accept the entire code in one operation.

- From: Forms & inputs
- Do: One paste fills all six digits, including the leading zero
- Don't: One paste fills only the first box
- Reasoning: `references/rules/form-13.md` · https://axiomui.nischal.fyi/rules/form-13

### Size the hit area for the input (`sys-3`)

Size the clickable area independently of the icon. A 44 × 44 CSS px target is a useful touch-friendly choice. WCAG 2.2 AA generally calls for 24 × 24 CSS px or a qualifying exception.

- From: System & logic
- Do: 44x44px hit area
- Don't: 16x16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Follow the keyboard model for each control (`sys-8`)

Make each task operable by keyboard. Use native behavior where available. Tab moves between stops, arrow keys often move within groups, and Escape dismisses a modal dialog.

- From: System & logic
- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

### Keep keyboard input responsive (`motion-2`)

When a shortcut opens a command palette, move focus into the field and accept the next keystroke while the panel settles.

- From: Motion & interaction
- Do: Keyboard panel: 0ms
- Don't: Keyboard panel: 240ms
- Reasoning: `references/rules/motion-2.md` · https://axiomui.nischal.fyi/rules/motion-2

### Preserve feedback with reduced motion (`motion-17`)

Honor reduced motion by removing unnecessary travel, zoom and spin. Show the resulting state through a stable label, icon or other persistent cue.

- From: Motion & interaction
- Do: Reduced motion: fade in place
- Don't: Reduced motion: slides anyway
- Reasoning: `references/rules/motion-17.md` · https://axiomui.nischal.fyi/rules/motion-17

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
