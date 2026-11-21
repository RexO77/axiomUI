# Forms & inputs

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Keep labels close to their fields (`form-1`)

Stack labels above fields when space is narrow or label lengths vary. A side-label layout can work when it preserves the association and has room for translated text.

- Do: Label above input
- Don't: Label left of input
- Reasoning: `references/rules/form-1.md` · https://axiomui.nischal.fyi/rules/form-1

## Keep field labels visible (`form-2`)

Keep a visible label after typing or autofill. A placeholder can illustrate an entry, but it disappears precisely when someone needs to review the completed form.

- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

## Make required and optional choices clear (`form-3`)

When most questions are required, state that convention and mark the optional exceptions in words. Keep the visible instructions and the form’s actual validation in agreement.

- Do: Full name · Email · Phone (Optional)
- Don't: Full name * · Email * · Phone *
- Reasoning: `references/rules/form-3.md` · https://axiomui.nischal.fyi/rules/form-3

## Match field width to plausible answers (`form-4`)

Use width as a cue when an answer has a predictable shape. Leave enough room for every supported format, including postal codes from the regions the form serves.

- Do: Short ZIP field / wider street address field
- Don't: Five-digit ZIP in a street-width field
- Reasoning: `references/rules/form-4.md` · https://axiomui.nischal.fyi/rules/form-4

## Match selection controls to the choice (`form-5`)

Use a radio group for one choice among alternatives and checkboxes for independent selections. A required radio group needs one answer by submission and can start unanswered.

- Do: Pick a plan: radios (1 selected)
- Don't: Pick a plan: checkboxes (2 selected)
- Reasoning: `references/rules/form-5.md` · https://axiomui.nischal.fyi/rules/form-5

## Expose alternatives worth comparing (`form-6`)

Show a short set of meaningful alternatives directly when space permits. A select works well when someone knows the answer they are looking for and displaying the full list would overwhelm the page.

- Do: Three billing cycles visible together
- Don't: Closed select hides the billing cycles
- Reasoning: `references/rules/form-6.md` · https://axiomui.nischal.fyi/rules/form-6

## Match the control to when the change takes effect (`form-7`)

Use a switch for an on/off setting that applies as it changes. A checkbox fits an option submitted with the rest of a form. Make the save behavior clear wherever the two appear together.

- Do: Dark mode = switch, email updates = checkbox
- Don't: Dark mode = switch, email updates = switch
- Reasoning: `references/rules/form-7.md` · https://axiomui.nischal.fyi/rules/form-7

## Validate when a correction is useful (`form-8`)

Show the first format error after the person submits the form. Give them time to finish and move between fields. Clear the error when the correction is accepted.

- Do: Error appears after Continue
- Don't: Error appears while typing
- Reasoning: `references/rules/form-8.md` · https://axiomui.nischal.fyi/rules/form-8

## Show format constraints before entry (`form-9`)

When a format really matters, show a persistent hint and a valid example. Accept equivalent input when it can be interpreted reliably.

- Do: MM / YY hint
- Don't: No format hint
- Reasoning: `references/rules/form-9.md` · https://axiomui.nischal.fyi/rules/form-9

## Give the form one clear reading order (`form-10`)

Stack unrelated questions so the next field is obvious. Group related short fields on one row only when their reading order, focus order and reflow remain clear.

- Do: Single column, stacked fields
- Don't: Two columns of unrelated fields
- Reasoning: `references/rules/form-10.md` · https://axiomui.nischal.fyi/rules/form-10

## Reuse answers the user has supplied (`form-11`)

When a later booking step needs the same answer, carry it forward or let the person select it. Keep the answer editable when it may have changed. Ask for information the booking cannot supply.

- Do: Country and date reused from this booking
- Don't: Already supplied country and date requested again
- Reasoning: `references/rules/form-11.md` · https://axiomui.nischal.fyi/rules/form-11

## Confirm the outcome of a submission (`form-12`)

After the service confirms a save, show the outcome where the user can find it. For a completed transaction, include the reference or next step they may need later.

- Do: Green checkmark + “Saved successfully”
- Don't: Saved value stays on screen without confirmation
- Reasoning: `references/rules/form-12.md` · https://axiomui.nischal.fyi/rules/form-12

## Accept a complete sign-in code in one paste (`form-13`)

Let people paste a one-time code as they receive it. Keep leading zeros and support autofill where available. A design with separate boxes can still accept the entire code in one operation.

- Do: One paste fills all six digits, including the leading zero
- Don't: One paste fills only the first box
- Reasoning: `references/rules/form-13.md` · https://axiomui.nischal.fyi/rules/form-13

## Declare what each field expects (`form-14`)

Declare the input type, keyboard layout, and autocomplete purpose so the browser can offer the right keys and saved answers. Turn off spellcheck and automatic capitalization for identifiers such as emails, usernames, and codes.

- Do: Email keyboard · saved address suggested
- Don't: Plain keyboard · capitalizes Maya@
- Reasoning: `references/rules/form-14.md` · https://axiomui.nischal.fyi/rules/form-14

## Keep entered answers when validation fails (`form-15`)

When validation fails, show every submitted answer so the person can correct it in place. Mark the fields that need attention.

- Do: Error on Work email · all answers kept
- Don't: Error on Work email · every field cleared
- Reasoning: `references/rules/form-15.md` · https://axiomui.nischal.fyi/rules/form-15
