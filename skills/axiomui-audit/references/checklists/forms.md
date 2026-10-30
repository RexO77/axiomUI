# Forms & inputs checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## Labels top aligned (`form-1`)

- Do: Label above input · Don't: Label left of input
- [ ] Is every label positioned above its input rather than beside it?
- [ ] Does a long translated label wrap cleanly without overlapping the input?
- [ ] Is the label-to-input spacing consistent across all fields on the form?
- Reasoning: `references/rules/form-1.md`

## No placeholders as labels (`form-2`)

- Do: Label: Work email / Placeholder: you@company.com · Don't: Label: none / Placeholder: Email address
- [ ] Does a persistent label stay visible after text is entered?
- [ ] Is the placeholder used only for an example format, not as the field name?
- [ ] Would the field’s purpose still be clear if the input were fully typed over?
- Reasoning: `references/rules/form-2.md`

## Mark optional, not required (`form-3`)

- Do: Full name · Email · Phone (Optional) · Don't: Full name * · Email * · Phone *
- [ ] Are optional fields the only ones carrying an explicit marker?
- [ ] Is the form free of asterisks on the majority of required fields?
- [ ] Can a user tell which fields are optional without reading every label?
- Reasoning: `references/rules/form-3.md`

## Input width hints (`form-4`)

- Do: ZIP: 5-char width / Street: full width · Don't: ZIP: full width / Street: full width
- [ ] Does the zip code field look noticeably shorter than the address field?
- [ ] Is any short-answer input stretched to the full width of the form?
- [ ] Does each input’s width roughly match its expected content length?
- Reasoning: `references/rules/form-4.md`

## Checkbox vs radio (`form-5`)

- Do: Pick a plan: radios (1 selected) · Don't: Pick a plan: checkboxes (2 selected)
- [ ] Are mutually exclusive choices like Pick a plan shown as radio buttons, not checkboxes?
- [ ] Can more than one option be selected where only one choice makes sense?
- [ ] Does the control’s shape (circle vs square) match how many can be selected?
- Reasoning: `references/rules/form-5.md`

## Dropdown vs radio (`form-6`)

- Do: 3 options = radios (3 of 3 visible) · Don't: 3 options = dropdown (0 of 3 visible)
- [ ] If a field has fewer than five options, are they shown as radio buttons?
- [ ] Does choosing an option require an extra click to open a menu first?
- [ ] Are all available choices visible without any interaction for short lists?
- Reasoning: `references/rules/form-6.md`

## Switch vs checkbox (`form-7`)

- Do: Dark mode = switch, email updates = checkbox · Don't: Dark mode = switch, email updates = switch
- [ ] Does every switch on the screen take effect immediately when toggled?
- [ ] Is a submit-dependent row like Email me product updates presented as a checkbox rather than a switch?
- [ ] Are there any switches whose effect only applies after a later submit?
- Reasoning: `references/rules/form-7.md`

## Validate on blur (`form-8`)

- Do: Error appears after leaving field · Don't: Error flashes on first character
- [ ] Does the error message wait until the user leaves the field before appearing?
- [ ] Does typing the first character ever trigger a visible error?
- [ ] Is validation timing consistent across every field on the form?
- Reasoning: `references/rules/form-8.md`

## Format hints (`form-9`)

- Do: MM / YY hint · Don't: No format hint
- [ ] Does every strictly formatted field show an example like MM / YY nearby?
- [ ] Is the hint visible while the user is actively typing, not hidden in a tooltip?
- [ ] Would a first-time user know the exact expected format without guessing?
- Reasoning: `references/rules/form-9.md`

## Single column forms (`form-10`)

- Do: Single column, stacked fields · Don't: Two columns of unrelated fields
- [ ] Are unrelated fields stacked in a single column rather than side by side?
- [ ] Are only logically paired fields (like First/Last name) placed next to each other?
- [ ] Does the tab order move straight down without jumping between columns?
- Reasoning: `references/rules/form-10.md`

## Smart defaults (`form-11`)

- Do: Country auto-detected from locale · Don't: Empty country dropdown (195 options)
- [ ] Is the country field pre-filled based on locale instead of shown empty?
- [ ] Do date pickers default to today’s date rather than opening blank?
- [ ] Can the user still change any pre-filled default before submitting?
- Reasoning: `references/rules/form-11.md`

## Success state feedback (`form-12`)

- Do: Green checkmark + “Saved successfully” · Don't: Form just resets silently
- [ ] Does a successful submission show explicit confirmation like a checkmark and message?
- [ ] Is silent form reset ever the only feedback given after submitting?
- [ ] Does the success message stay visible long enough for the user to notice it?
- Reasoning: `references/rules/form-12.md`
