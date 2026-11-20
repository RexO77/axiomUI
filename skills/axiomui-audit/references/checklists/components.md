# Components & actions checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Prioritize the next action (`comp-1`)

- Do: 1 filled + 1 outline + 1 ghost button · Don't: 3 filled buttons side by side
- [ ] What is someone trying to finish here?
- [ ] Can someone who wants to cancel find that option?
- [ ] Is there a reason to recommend one of these choices?
- Reasoning: `references/rules/comp-1.md`

## Confirm irreversible deletion (`comp-2`)

- Do: Secondary “Delete project…” → red confirm · Don't: Red “Delete” in the row, no confirm
- [ ] Whose data changes?
- [ ] Could the confirmation be mistaken for a harmless removal?
- [ ] Can someone back out using only the keyboard?
- Reasoning: `references/rules/comp-2.md`

## Align nested corner radii (`comp-3`)

- Do: Outer 12px = Inner 4px + Inset 8px · Don't: Outer 4px and inner 4px with an 8px inset
- [ ] Which two edges should track each other?
- [ ] Has the border been included in their separation?
- [ ] Does the corner still read as an even inset at the smallest component size?
- Reasoning: `references/rules/comp-3.md`

## Distinguish people from content (`comp-4`)

- Do: Avatar = circle, file = rectangle · Don't: Avatar = square, file = rectangle
- [ ] Can a reader distinguish a person from a file without recognizing the photo?
- [ ] How does a team avatar differ from an individual in this system?
- [ ] Does a missing image preserve the same identity cue?
- Reasoning: `references/rules/comp-4.md`

## Choose a surface for the task (`comp-5`)

- Do: Profile editor beside the visible record · Don't: Six profile fields in a one-row modal viewport
- [ ] Can the user see the information needed to finish?
- [ ] Can they interact with the underlying page when the task calls for it?
- [ ] Would a dedicated page give a complex task a clearer sequence?
- Reasoning: `references/rules/comp-5.md`

## Place field errors beside the field (`comp-6`)

- Do: Invalid email = inline, under the field · Don't: Invalid email = toast, far from the field
- [ ] Can someone find the field from the summary?
- [ ] Does the message explain a correction the user can actually make?
- [ ] Can someone returning to the field still read the error?
- Reasoning: `references/rules/comp-6.md`

## Label ambiguous actions (`comp-7`)

- Do: Icon + label on every toolbar action · Don't: Icon only on every toolbar action
- [ ] What else might this glyph mean in this context?
- [ ] Can someone identify the action without hover?
- [ ] Does the accessible name match the visible action?
- Reasoning: `references/rules/comp-7.md`

## Explain unavailable actions (`comp-8`)

- Do: Disabled + reason under the button · Don't: Disabled + no reason
- [ ] Is the cause apparent before trying the control?
- [ ] Does the explanation say what can change the state?
- [ ] Can keyboard and touch users find it?
- Reasoning: `references/rules/comp-8.md`

## Acknowledge a pending submission (`comp-9`)

- Do: Spinner + disabled during submit · Don't: Static button allows double-click
- [ ] Does the user know the request is still pending?
- [ ] Can a retry create the same order twice?
- [ ] Can someone recover after a timeout without re-entering the form?
- Reasoning: `references/rules/comp-9.md`

## Match icon scale within a toolbar (`comp-10`)

- Do: All toolbar icons: 20px · Don't: Mixed 16px, 20px, 24px icons in toolbar
- [ ] Which actions belong to the same group?
- [ ] Does one glyph dominate without a reason?
- [ ] Can the button remain easy to hit even when the drawing is small?
- Reasoning: `references/rules/comp-10.md`

## Size a card’s primary link (`comp-11`)

- Do: Single-destination card with a card-sized target · Don't: Card looks clickable, only its title responds
- [ ] Does the visual affordance agree with the clickable area?
- [ ] Can each secondary action be operated independently?
- [ ] Can readers select text that they may need to copy?
- Reasoning: `references/rules/comp-11.md`

## Make overlay dismissal discoverable (`comp-12`)

- Do: X button + backdrop close + Esc key · Don't: No close button, only backdrop click
- [ ] Can a keyboard user discover how to leave?
- [ ] What happens to an unsaved edit after Escape or a backdrop click?
- [ ] Where does focus land after dismissal?
- Reasoning: `references/rules/comp-12.md`

## Make the chart’s question answerable in text (`comp-13`)

- Do: Summarize the trend and offer the monthly counts · Don't: Leave the trend and counts in the bars alone
- [ ] With the bars hidden, which queue grew over the selected period?
- [ ] Can a reader find March’s billing count and identify its unit using the table headers?
- [ ] After changing the quarter, do the plotted values, summary and table still agree?
- Reasoning: `references/rules/comp-13.md`
