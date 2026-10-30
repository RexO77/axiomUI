---
name: axiomui-forms
description: Axiom UI's form and input rules, with Do/Don't values and reasoning. Use when building or reviewing forms; placing labels, marking optional fields, sizing inputs to their expected content, choosing between checkboxes, radios, switches, and dropdowns, timing validation, writing format hints, picking smart defaults, laying out single-column forms, or confirming a successful submission.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Forms & inputs

Every field is a question that costs the user effort. These rules keep labels visible while typing, size inputs to the answer they expect, match the control to the shape of the choice, and time validation so an error helps the user instead of interrupting them. Then they close the loop with a visible success state.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Apply its Do as written. Values are targets, not suggestions.
3. Check the result against its Don't. Code that matches the Don't is a violation, whatever the intent behind it.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Labels top aligned (`form-1`)

Top-aligned labels work best on mobile and allow for variable label length (translation friendly).

- Do: Label above input
- Don't: Label left of input
- Reasoning: `references/rules/form-1.md` · https://axiomui.nischal.fyi/rules/form-1

### No placeholders as labels (`form-2`)

Placeholders disappear when you type. Users forget what the field was. Use persistent labels.

- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

### Mark optional, not required (`form-3`)

If 90% of fields are required, don't put red asterisks everywhere. Just mark the exceptions as (Optional).

- Do: Full name · Email · Phone (Optional)
- Don't: Full name * · Email * · Phone *
- Reasoning: `references/rules/form-3.md` · https://axiomui.nischal.fyi/rules/form-3

### Input width hints (`form-4`)

Size a field to the content it expects. A full-width box for a five-character ZIP tells the user to keep typing, and a form of identical boxes gives the eye nothing to structure.

- Do: ZIP: 5-char width / Street: full width
- Don't: ZIP: full width / Street: full width
- Reasoning: `references/rules/form-4.md` · https://axiomui.nischal.fyi/rules/form-4

### Checkbox vs radio (`form-5`)

A radio group means pick exactly one; checkboxes mean pick any number. The control's shape is the only promise the user gets before they click, so breaking it costs them a retry.

- Do: Pick a plan: radios (1 selected)
- Don't: Pick a plan: checkboxes (2 selected)
- Reasoning: `references/rules/form-5.md` · https://axiomui.nischal.fyi/rules/form-5

### Dropdown vs radio (`form-6`)

With fewer than five options, show them all as radio buttons instead of hiding them in a dropdown. A dropdown costs a click and hides the shape of the choice until you open it.

- Do: 3 options = radios (3 of 3 visible)
- Don't: 3 options = dropdown (0 of 3 visible)
- Reasoning: `references/rules/form-6.md` · https://axiomui.nischal.fyi/rules/form-6

### Switch vs checkbox (`form-7`)

A switch promises the change already happened, like a light switch. A checkbox promises 'choose now, submit later'. Pick the one that matches when the change actually lands.

- Do: Dark mode = switch, email updates = checkbox
- Don't: Dark mode = switch, email updates = switch
- Reasoning: `references/rules/form-7.md` · https://axiomui.nischal.fyi/rules/form-7

### Validate on blur (`form-8`)

Inline validation should fire when the user leaves a field, not on every keystroke. Nobody types a valid email on the first character, so per-keystroke validation shows an error for the whole time it is being fixed.

- Do: Error appears after leaving field
- Don't: Error flashes on first character
- Reasoning: `references/rules/form-8.md` · https://axiomui.nischal.fyi/rules/form-8

### Format hints (`form-9`)

When a field accepts only one format, show an example beside it. Readers copy the shape of an example far faster than they decode an error message about the guess they just made.

- Do: MM / YY hint
- Don't: No format hint
- Reasoning: `references/rules/form-9.md` · https://axiomui.nischal.fyi/rules/form-9

### Single column forms (`form-10`)

Multi-column forms slow completion. Use single column unless fields are logically paired (First/Last name, City/State).

- Do: Single column, stacked fields
- Don't: Two columns of unrelated fields
- Reasoning: `references/rules/form-10.md` · https://axiomui.nischal.fyi/rules/form-10

### Smart defaults (`form-11`)

Pre-fill fields with the most common answer when possible (e.g., default country from locale, today's date for date pickers).

- Do: Country auto-detected from locale
- Don't: Empty country dropdown (195 options)
- Reasoning: `references/rules/form-11.md` · https://axiomui.nischal.fyi/rules/form-11

### Success state feedback (`form-12`)

Show positive confirmation after successful submission (not just absence of errors). Users need to know it worked.

- Do: Green checkmark + “Saved successfully”
- Don't: Form just resets silently
- Reasoning: `references/rules/form-12.md` · https://axiomui.nischal.fyi/rules/form-12

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
