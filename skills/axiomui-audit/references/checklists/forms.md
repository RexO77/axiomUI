# Forms & inputs checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Keep labels close to their fields (`form-1`)

Stack labels above fields when space is narrow or label lengths vary. A side-label layout can work when it preserves the association and has room for translated text.

- Do: Label above input · Don't: Label left of input
- [ ] Can someone match each label to its control at a glance?
- [ ] Does the full label survive reflow?
- [ ] Does the accessible name still make sense when read on its own?
- Reasoning: `references/rules/form-1.md`

## Keep field labels visible (`form-2`)

Keep a visible label after typing or autofill. A placeholder can illustrate an entry, but it disappears precisely when someone needs to review the completed form.

- Do: Label: Work email / Placeholder: you@company.com · Don't: Label: none / Placeholder: Email address
- [ ] Can someone identify each filled field?
- [ ] Can they find its instructions while editing?
- [ ] Does a screen reader announce the same purpose as the visible label?
- Reasoning: `references/rules/form-2.md`

## Make required and optional choices clear (`form-3`)

When most questions are required, state that convention and mark the optional exceptions in words. Keep the visible instructions and the form’s actual validation in agreement.

- Do: Full name · Email · Phone (Optional) · Don't: Full name * · Email * · Phone *
- [ ] Can someone tell which questions may be skipped?
- [ ] Do announced and visual requirements agree?
- [ ] Will the service accept a blank optional answer?
- Reasoning: `references/rules/form-3.md`

## Match field width to plausible answers (`form-4`)

Use width as a cue when an answer has a predictable shape. Leave enough room for every supported format, including postal codes from the regions the form serves.

- Do: Short ZIP field / wider street address field · Don't: Five-digit ZIP in a street-width field
- [ ] Which regions and formats does this form support?
- [ ] Is a valid longer answer still readable?
- [ ] Does the backend accept the same formats as the field?
- Reasoning: `references/rules/form-4.md`

## Match selection controls to the choice (`form-5`)

Use a radio group for one choice among alternatives and checkboxes for independent selections. A required radio group needs one answer by submission and can start unanswered.

- Do: Pick a plan: radios (1 selected) · Don't: Pick a plan: checkboxes (2 selected)
- [ ] Can more than one answer be valid?
- [ ] Can a person leave an optional question unanswered after changing their mind?
- [ ] Does keyboard selection follow the native control pattern?
- Reasoning: `references/rules/form-5.md`

## Expose alternatives worth comparing (`form-6`)

Show a short set of meaningful alternatives directly when space permits. A select works well when someone knows the answer they are looking for and displaying the full list would overwhelm the page.

- Do: Three billing cycles visible together · Don't: Closed select hides the billing cycles
- [ ] Can someone compare the important differences before choosing?
- [ ] Does a long list support finding a known answer?
- [ ] Can the choice be made on a phone and with a keyboard?
- Reasoning: `references/rules/form-6.md`

## Match the control to when the change takes effect (`form-7`)

Use a switch for an on/off setting that applies as it changes. A checkbox fits an option submitted with the rest of a form. Make the save behavior clear wherever the two appear together.

- Do: Dark mode = switch, email updates = checkbox · Don't: Dark mode = switch, email updates = switch
- [ ] Which settings take effect immediately?
- [ ] Is the save boundary visible?
- [ ] Does the announced state match the value that will persist?
- Reasoning: `references/rules/form-7.md`

## Validate when a correction is useful (`form-8`)

Show the first format error after the person submits the form. Give them time to finish and move between fields. Clear the error when the correction is accepted.

- Do: Error appears after Continue · Don't: Error appears while typing
- [ ] Can someone type maya@ and Tab away before submitting without seeing an error?
- [ ] Does pressing Continue with that same value show the format error?
- [ ] Does the error clear when the entered address is accepted?
- Reasoning: `references/rules/form-8.md`

## Show format constraints before entry (`form-9`)

When a format really matters, show a persistent hint and a valid example. Accept equivalent input when it can be interpreted reliably.

- Do: MM / YY hint · Don't: No format hint
- [ ] Can someone enter a valid answer on their first attempt?
- [ ] Which variations can be normalized safely?
- [ ] Does the error show an example that this particular field accepts?
- Reasoning: `references/rules/form-9.md`

## Give the form one clear reading order (`form-10`)

Stack unrelated questions so the next field is obvious. Group related short fields on one row only when their reading order, focus order and reflow remain clear.

- Do: Single column, stacked fields · Don't: Two columns of unrelated fields
- [ ] Can someone predict the next question?
- [ ] Does Tab preserve a meaningful order after reflow?
- [ ] Do the grouped fields belong together in the locales supported?
- Reasoning: `references/rules/form-10.md`

## Reuse answers the user has supplied (`form-11`)

When a later booking step needs the same answer, carry it forward or let the person select it. Keep the answer editable when it may have changed. Ask for information the booking cannot supply.

- Do: Country and date reused from this booking · Don't: Already supplied country and date requested again
- [ ] Where did this answer come from?
- [ ] Can someone review and change it before submitting?
- [ ] What happens if the form’s guess is wrong?
- Reasoning: `references/rules/form-11.md`

## Confirm the outcome of a submission (`form-12`)

After the service confirms a save, show the outcome where the user can find it. For a completed transaction, include the reference or next step they may need later.

- Do: Green checkmark + “Saved successfully” · Don't: Saved value stays on screen without confirmation
- [ ] Was success confirmed by the service?
- [ ] Can someone perceive the outcome without seeing the icon?
- [ ] Can they recover the reference or next step later?
- Reasoning: `references/rules/form-12.md`

## Accept a complete sign-in code in one paste (`form-13`)

Let people paste a one-time code as they receive it. Keep leading zeros and support autofill where available. A design with separate boxes can still accept the entire code in one operation.

- Do: One paste fills all six digits, including the leading zero · Don't: One paste fills only the first box
- [ ] Can a person paste 012345 once, correct a digit and submit the intended string?
- [ ] Does signing in with a saved password work before the code step?
- [ ] If transcription is required on one path, which available path lets someone complete authentication without it?
- Reasoning: `references/rules/form-13.md`

## Declare what each field expects (`form-14`)

Declare the input type, keyboard layout, and autocomplete purpose so the browser can offer the right keys and saved answers. Turn off spellcheck and automatic capitalization for identifiers such as emails, usernames, and codes.

- Do: Email keyboard · saved address suggested · Don't: Plain keyboard · capitalizes Maya@
- [ ] On a phone with a saved autofill address, tap Work email, check for @ and the saved address, then type maya@. Does the name stay lowercase?
- [ ] Does the sign-in field declare the purpose the browser’s credential manager expects?
- [ ] If you enter 012345 in a numeric code field, does the first zero reach the form submission?
- Reasoning: `references/rules/form-14.md`

## Keep entered answers when validation fails (`form-15`)

When validation fails, show every submitted answer so the person can correct it in place. Mark the fields that need attention.

- Do: Error on Work email · all answers kept · Don't: Error on Work email · every field cleared
- [ ] Enter Maya Chen, maya@, and Acme Design in a form whose validation runs after submission. Press Continue and wait for the Work email error. Are all three values still in their fields?
- [ ] Can you finish the address and submit again by editing only Work email?
- [ ] Does a failed response after a second attempt preserve the most recently submitted values?
- Reasoning: `references/rules/form-15.md`
