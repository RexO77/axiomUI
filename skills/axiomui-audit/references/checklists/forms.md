# Forms & inputs checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Stack labels when space is tight (`form-1`)

Stack labels above fields on narrow screens or when label lengths vary. On wider screens, a shared label column can keep fields aligned. Leave room for translations to wrap.

- Do: Labels above · fields share one left edge · Don’t: Uneven side labels push fields out of alignment
- [ ] Can someone match each label to its control at a glance?
- [ ] Can you still read the whole label when it wraps?
- [ ] Does the accessible name still make sense when read on its own?
- Reasoning: `references/rules/form-1.md`

## Keep field labels visible (`form-2`)

Give each field a label that stays visible after typing or autofill. Use the placeholder for an example that can disappear.

- Do: Label: Work email / Placeholder: you@company.com · Don’t: Label: none / Placeholder: Email address
- [ ] Can someone identify each filled field?
- [ ] Can they find its instructions while editing?
- [ ] Does a screen reader announce the same purpose as the visible label?
- Reasoning: `references/rules/form-2.md`

## Mark optional fields (`form-3`)

When most fields are required, say so before the first field. Label the others “optional” and accept them blank.

- Do: Phone labeled optional · Don’t: Optional phone number marked required
- [ ] Can someone tell which questions may be skipped?
- [ ] Do announced and visual requirements agree?
- [ ] Will the service accept a blank optional answer?
- Reasoning: `references/rules/form-3.md`

## Size fields for the expected answer (`form-4`)

Size fields for the answers you expect. For postal codes, allow room for the longest format you accept.

- Do: Short ZIP field / wider street address field · Don’t: Five-digit ZIP in a street-width field
- [ ] Which regions and formats does this form support?
- [ ] Is a valid longer answer still readable?
- [ ] Does the backend accept the same formats as the field?
- Reasoning: `references/rules/form-4.md`

## Match selection controls to the choice (`form-5`)

Use radio buttons for one choice and checkboxes for independent choices. A required radio group can start empty and require a selection on submission.

- Do: Pick a plan: radios (1 selected) · Don’t: Pick a plan: checkboxes (2 selected)
- [ ] Can more than one answer be valid?
- [ ] Can a person leave an optional question unanswered after changing their mind?
- [ ] Does keyboard selection follow the native control pattern?
- Reasoning: `references/rules/form-5.md`

## Show options people need to compare (`form-6`)

Show short lists in full so people can compare options. Use a dropdown for a long list when people already know their answer, such as their country.

- Do: Three billing cycles visible together · Don’t: Closed select hides the billing cycles
- [ ] Can someone compare the important differences before choosing?
- [ ] Does a long list support finding a known answer?
- [ ] Can the choice be made on a phone and with a keyboard?
- Reasoning: `references/rules/form-6.md`

## Use switches for changes that apply immediately (`form-7`)

Use a switch for a setting that takes effect immediately. Use a checkbox for a choice that waits for Save. When both appear together, label which changes need saving.

- Do: Email updates · checkbox takes effect after Save changes · Don’t: Email updates · switch still waits for Save changes
- [ ] Which settings take effect immediately?
- [ ] Can you tell which settings wait for Save changes?
- [ ] Does the announced state match the value that will persist?
- Reasoning: `references/rules/form-7.md`

## Show format errors on submission (`form-8`)

Let people type and move between fields. Show format errors on submission and clear each one when the field is valid.

- Do: Error appears after Continue · Don’t: Error appears while typing
- [ ] Can someone type maya@ and Tab away before submitting without seeing an error?
- [ ] Does pressing Continue with that same value show the format error?
- [ ] Does the error clear when the entered address is accepted?
- Reasoning: `references/rules/form-8.md`

## Show the expected format before typing (`form-9`)

Show the expected format before typing and keep it visible during editing. Accept other formats you can read without guessing.

- Do: MM / YY shown before typing · Don’t: MM / YY shown only after an error
- [ ] Can someone enter a valid answer on their first attempt?
- [ ] Which variations can be normalized safely?
- [ ] Does the error show an example that this particular field accepts?
- Reasoning: `references/rules/form-9.md`

## Give the form one clear reading order (`form-10`)

Stack unrelated fields in one column. Short related fields can share a row if Tab follows reading order and the fields stay readable on narrow screens.

- Do: One column · Tab follows reading order · Don’t: Two columns · Tab order differs from reading order
- [ ] Can someone predict the next question?
- [ ] Does Tab preserve a meaningful order after reflow?
- [ ] Do the grouped fields belong together in the locales supported?
- Reasoning: `references/rules/form-10.md`

## Reuse answers from earlier steps (`form-11`)

When a later step needs an earlier answer, fill it in or offer it as a choice. Let people change it.

- Do: Country and start date carried forward · Don’t: Country and start date requested again
- [ ] Where did this answer come from?
- [ ] Can someone review and change it before submitting?
- [ ] What happens if the form’s guess is wrong?
- Reasoning: `references/rules/form-11.md`

## Confirm what was saved (`form-12`)

When the server confirms a save, show a message beside the Save button. After a purchase or booking, include the reference number or the next step.

- Do: Checkmark and confirmation beside Save changes · Don’t: No confirmation beside Save changes
- [ ] Was success confirmed by the service?
- [ ] Can someone perceive the outcome without seeing the icon?
- [ ] Can they recover the reference or next step later?
- Reasoning: `references/rules/form-12.md`

## Accept a one-time code in one paste (`form-13`)

Accept the whole one-time code in one paste, even across separate boxes. Keep leading zeros and support autofill where available.

- Do: One paste fills all six digits, including the leading zero · Don’t: One paste fills only the first box
- [ ] Can you paste 012345, correct a digit and submit the code with its leading zero intact?
- [ ] Does signing in with a saved password work before the code step?
- [ ] If one sign-in method requires retyping the code, which method lets someone skip that step?
- Reasoning: `references/rules/form-13.md`

## Declare what each field expects (`form-14`)

Set type, inputmode and autocomplete so browsers can offer the right keyboard and saved answers. Turn off spellcheck and automatic capitalization for email addresses, usernames and codes.

- Do: Email keyboard · saved email address suggested · Don’t: Plain keyboard · capitalizes Maya@
- [ ] On a phone with a saved email address, tap Work email. Is @ on the main keyboard? Is the saved address offered? Type maya@. Does the m stay lowercase?
- [ ] Does the sign-in field declare the purpose the browser’s credential manager expects?
- [ ] If you enter 012345 in a numeric code field, does the first zero reach the form submission?
- Reasoning: `references/rules/form-14.md`

## Keep entered answers when validation fails (`form-15`)

After a validation error, keep answers people can safely review, including the entry they need to correct. Mark the fields that need changes.

- Do: Error on Work email · all answers kept · Don’t: Error on Work email · every field cleared
- [ ] Enter Maya Chen, maya@, and Acme Design in a form whose validation runs after submission. Press Continue and wait for the Work email error. Are all three values still in their fields?
- [ ] Can you finish the address and submit again by editing only Work email?
- [ ] Does a failed response after a second attempt preserve the most recently submitted values?
- Reasoning: `references/rules/form-15.md`
