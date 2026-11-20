# Forms & inputs checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Keep labels close to their fields (`form-1`)

- Do: Label above input · Don't: Label left of input
- [ ] Can someone match each label to its control at a glance?
- [ ] Does the full label survive reflow?
- [ ] Does the accessible name still make sense when read on its own?
- Reasoning: `references/rules/form-1.md`

## Keep field labels visible (`form-2`)

- Do: Label: Work email / Placeholder: you@company.com · Don't: Label: none / Placeholder: Email address
- [ ] Can someone identify each filled field?
- [ ] Can they find its instructions while editing?
- [ ] Does a screen reader announce the same purpose as the visible label?
- Reasoning: `references/rules/form-2.md`

## Make required and optional choices clear (`form-3`)

- Do: Full name · Email · Phone (Optional) · Don't: Full name * · Email * · Phone *
- [ ] Can someone tell which questions may be skipped?
- [ ] Do announced and visual requirements agree?
- [ ] Will the service accept a blank optional answer?
- Reasoning: `references/rules/form-3.md`

## Match field width to plausible answers (`form-4`)

- Do: Short ZIP field / wider street address field · Don't: Five-digit ZIP in a street-width field
- [ ] Which regions and formats does this form support?
- [ ] Is a valid longer answer still readable?
- [ ] Does the backend accept the same formats as the field?
- Reasoning: `references/rules/form-4.md`

## Match selection controls to the choice (`form-5`)

- Do: Pick a plan: radios (1 selected) · Don't: Pick a plan: checkboxes (2 selected)
- [ ] Can more than one answer be valid?
- [ ] Can a person leave an optional question unanswered after changing their mind?
- [ ] Does keyboard selection follow the native control pattern?
- Reasoning: `references/rules/form-5.md`

## Expose alternatives worth comparing (`form-6`)

- Do: Three billing cycles visible together · Don't: Closed select hides the billing cycles
- [ ] Can someone compare the important differences before choosing?
- [ ] Does a long list support finding a known answer?
- [ ] Can the choice be made on a phone and with a keyboard?
- Reasoning: `references/rules/form-6.md`

## Match the control to when the change takes effect (`form-7`)

- Do: Dark mode = switch, email updates = checkbox · Don't: Dark mode = switch, email updates = switch
- [ ] Which settings take effect immediately?
- [ ] Is the save boundary visible?
- [ ] Does the announced state match the value that will persist?
- Reasoning: `references/rules/form-7.md`

## Validate when a correction is useful (`form-8`)

- Do: Error appears after leaving field · Don't: Error appears during incomplete entry
- [ ] Can someone start an address without an error flash?
- [ ] Does submitting from the final field still catch a problem?
- [ ] Does the error clear when the entered address is accepted?
- Reasoning: `references/rules/form-8.md`

## Show format constraints before entry (`form-9`)

- Do: MM / YY hint · Don't: No format hint
- [ ] Can someone enter a valid answer on their first attempt?
- [ ] Which variations can be normalized safely?
- [ ] Does the error show an example that this particular field accepts?
- Reasoning: `references/rules/form-9.md`

## Give the form one clear reading order (`form-10`)

- Do: Single column, stacked fields · Don't: Two columns of unrelated fields
- [ ] Can someone predict the next question?
- [ ] Does Tab preserve a meaningful order after reflow?
- [ ] Do the grouped fields belong together in the locales supported?
- Reasoning: `references/rules/form-10.md`

## Reuse answers the user has supplied (`form-11`)

- Do: Country and date reused from this booking · Don't: Already supplied country and date requested again
- [ ] Where did this answer come from?
- [ ] Can someone review and change it before submitting?
- [ ] What happens if the form’s guess is wrong?
- Reasoning: `references/rules/form-11.md`

## Confirm the outcome of a submission (`form-12`)

- Do: Green checkmark + “Saved successfully” · Don't: Saved value stays on screen without confirmation
- [ ] Was success confirmed by the service?
- [ ] Can someone perceive the outcome without seeing the icon?
- [ ] Can they recover the reference or next step later?
- Reasoning: `references/rules/form-12.md`

## Accept a complete sign-in code in one paste (`form-13`)

- Do: One paste fills all six digits, including the leading zero · Don't: One paste fills only the first box
- [ ] Can a person paste 012345 once, correct a digit and submit the intended string?
- [ ] Does signing in with a saved password work before the code step?
- [ ] If transcription is required on one path, which available path lets someone complete authentication without it?
- Reasoning: `references/rules/form-13.md`
