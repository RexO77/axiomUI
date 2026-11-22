# Forms & inputs

Compact Do/Don’t for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Stack labels when space is tight (`form-1`)

Stack labels above fields on narrow screens or when label lengths vary. On wider screens, a shared label column can keep fields aligned. Leave room for translations to wrap.

- Do: Labels above · fields share one left edge
- Don’t: Uneven side labels push fields out of alignment
- Reasoning: `references/rules/form-1.md` · https://axiomui.nischal.fyi/rules/form-1

## Keep field labels visible (`form-2`)

Give each field a label that stays visible after typing or autofill. Use the placeholder for an example that can disappear.

- Do: Label: Work email / Placeholder: you@company.com
- Don’t: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

## Mark optional fields (`form-3`)

When most fields are required, say so before the first field. Label the others “optional” and accept them blank.

- Do: Phone labeled optional
- Don’t: Optional phone number marked required
- Reasoning: `references/rules/form-3.md` · https://axiomui.nischal.fyi/rules/form-3

## Size fields for the expected answer (`form-4`)

Size fields for the answers you expect. For postal codes, allow room for the longest format you accept.

- Do: Short ZIP field / wider street address field
- Don’t: Five-digit ZIP in a street-width field
- Reasoning: `references/rules/form-4.md` · https://axiomui.nischal.fyi/rules/form-4

## Match selection controls to the choice (`form-5`)

Use radio buttons for one choice and checkboxes for independent choices. A required radio group can start empty and require a selection on submission.

- Do: Pick a plan: radios (1 selected)
- Don’t: Pick a plan: checkboxes (2 selected)
- Reasoning: `references/rules/form-5.md` · https://axiomui.nischal.fyi/rules/form-5

## Show options people need to compare (`form-6`)

Show short lists in full so people can compare options. Use a dropdown for a long list when people already know their answer, such as their country.

- Do: Three billing cycles visible together
- Don’t: Closed select hides the billing cycles
- Reasoning: `references/rules/form-6.md` · https://axiomui.nischal.fyi/rules/form-6

## Use switches for changes that apply immediately (`form-7`)

Use a switch for a setting that takes effect immediately. Use a checkbox for a choice that waits for Save. When both appear together, label which changes need saving.

- Do: Email updates · checkbox takes effect after Save changes
- Don’t: Email updates · switch still waits for Save changes
- Reasoning: `references/rules/form-7.md` · https://axiomui.nischal.fyi/rules/form-7

## Show format errors on submission (`form-8`)

Let people type and move between fields. Show format errors on submission and clear each one when the field is valid.

- Do: Error appears after Continue
- Don’t: Error appears while typing
- Reasoning: `references/rules/form-8.md` · https://axiomui.nischal.fyi/rules/form-8

## Show the expected format before typing (`form-9`)

Show the expected format before typing and keep it visible during editing. Accept other formats you can read without guessing.

- Do: MM / YY shown before typing
- Don’t: MM / YY shown only after an error
- Reasoning: `references/rules/form-9.md` · https://axiomui.nischal.fyi/rules/form-9

## Give the form one clear reading order (`form-10`)

Stack unrelated fields in one column. Short related fields can share a row if Tab follows reading order and the fields stay readable on narrow screens.

- Do: One column · Tab follows reading order
- Don’t: Two columns · Tab order differs from reading order
- Reasoning: `references/rules/form-10.md` · https://axiomui.nischal.fyi/rules/form-10

## Reuse answers from earlier steps (`form-11`)

When a later step needs an earlier answer, fill it in or offer it as a choice. Let people change it.

- Do: Country and start date carried forward
- Don’t: Country and start date requested again
- Reasoning: `references/rules/form-11.md` · https://axiomui.nischal.fyi/rules/form-11

## Confirm what was saved (`form-12`)

When the server confirms a save, show a message beside the Save button. After a purchase or booking, include the reference number or the next step.

- Do: Checkmark and confirmation beside Save changes
- Don’t: No confirmation beside Save changes
- Reasoning: `references/rules/form-12.md` · https://axiomui.nischal.fyi/rules/form-12

## Accept a one-time code in one paste (`form-13`)

Accept the whole one-time code in one paste, even across separate boxes. Keep leading zeros and support autofill where available.

- Do: One paste fills all six digits, including the leading zero
- Don’t: One paste fills only the first box
- Reasoning: `references/rules/form-13.md` · https://axiomui.nischal.fyi/rules/form-13

## Declare what each field expects (`form-14`)

Set type, inputmode and autocomplete so browsers can offer the right keyboard and saved answers. Turn off spellcheck and automatic capitalization for email addresses, usernames and codes.

- Do: Email keyboard · saved email address suggested
- Don’t: Plain keyboard · capitalizes Maya@
- Reasoning: `references/rules/form-14.md` · https://axiomui.nischal.fyi/rules/form-14

## Keep entered answers when validation fails (`form-15`)

After a validation error, keep answers people can safely review, including the entry they need to correct. Mark the fields that need changes.

- Do: Error on Work email · all answers kept
- Don’t: Error on Work email · every field cleared
- Reasoning: `references/rules/form-15.md` · https://axiomui.nischal.fyi/rules/form-15
