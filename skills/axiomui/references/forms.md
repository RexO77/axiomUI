# Forms & inputs

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Labels top aligned (`form-1`)

Top-aligned labels work best on mobile and allow for variable label length (translation friendly).

- Do: Label above input
- Don't: Label left of input
- Reasoning: `references/rules/form-1.md` · https://axiomui.nischal.fyi/rules/form-1

## No placeholders as labels (`form-2`)

Placeholders disappear when you type. Users forget what the field was. Use persistent labels.

- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

## Mark optional, not required (`form-3`)

If 90% of fields are required, don't put red asterisks everywhere. Just mark the exceptions as (Optional).

- Do: Full name · Email · Phone (Optional)
- Don't: Full name * · Email * · Phone *
- Reasoning: `references/rules/form-3.md` · https://axiomui.nischal.fyi/rules/form-3

## Input width hints (`form-4`)

Size a field to the content it expects. A full-width box for a five-character ZIP tells the user to keep typing, and a form of identical boxes gives the eye nothing to structure.

- Do: ZIP: 5-char width / Street: full width
- Don't: ZIP: full width / Street: full width
- Reasoning: `references/rules/form-4.md` · https://axiomui.nischal.fyi/rules/form-4

## Checkbox vs radio (`form-5`)

A radio group means pick exactly one; checkboxes mean pick any number. The control's shape is the only promise the user gets before they click, so breaking it costs them a retry.

- Do: Pick a plan: radios (1 selected)
- Don't: Pick a plan: checkboxes (2 selected)
- Reasoning: `references/rules/form-5.md` · https://axiomui.nischal.fyi/rules/form-5

## Dropdown vs radio (`form-6`)

With fewer than five options, show them all as radio buttons instead of hiding them in a dropdown. A dropdown costs a click and hides the shape of the choice until you open it.

- Do: 3 options = radios (3 of 3 visible)
- Don't: 3 options = dropdown (0 of 3 visible)
- Reasoning: `references/rules/form-6.md` · https://axiomui.nischal.fyi/rules/form-6

## Switch vs checkbox (`form-7`)

A switch promises the change already happened, like a light switch. A checkbox promises 'choose now, submit later'. Pick the one that matches when the change actually lands.

- Do: Dark mode = switch, email updates = checkbox
- Don't: Dark mode = switch, email updates = switch
- Reasoning: `references/rules/form-7.md` · https://axiomui.nischal.fyi/rules/form-7

## Validate on blur (`form-8`)

Inline validation should fire when the user leaves a field, not on every keystroke. Nobody types a valid email on the first character, so per-keystroke validation shows an error for the whole time it is being fixed.

- Do: Error appears after leaving field
- Don't: Error flashes on first character
- Reasoning: `references/rules/form-8.md` · https://axiomui.nischal.fyi/rules/form-8

## Format hints (`form-9`)

When a field accepts only one format, show an example beside it. Readers copy the shape of an example far faster than they decode an error message about the guess they just made.

- Do: MM / YY hint
- Don't: No format hint
- Reasoning: `references/rules/form-9.md` · https://axiomui.nischal.fyi/rules/form-9

## Single column forms (`form-10`)

Multi-column forms slow completion. Use single column unless fields are logically paired (First/Last name, City/State).

- Do: Single column, stacked fields
- Don't: Two columns of unrelated fields
- Reasoning: `references/rules/form-10.md` · https://axiomui.nischal.fyi/rules/form-10

## Smart defaults (`form-11`)

Pre-fill fields with the most common answer when possible (e.g., default country from locale, today's date for date pickers).

- Do: Country auto-detected from locale
- Don't: Empty country dropdown (195 options)
- Reasoning: `references/rules/form-11.md` · https://axiomui.nischal.fyi/rules/form-11

## Success state feedback (`form-12`)

Show positive confirmation after successful submission (not just absence of errors). Users need to know it worked.

- Do: Green checkmark + “Saved successfully”
- Don't: Form just resets silently
- Reasoning: `references/rules/form-12.md` · https://axiomui.nischal.fyi/rules/form-12
