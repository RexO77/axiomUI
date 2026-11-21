# Components & actions checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Prioritize the next action (`comp-1`)

Give the next step in a task the strongest button treatment. When two choices deserve equal consideration, give them equal weight.

- Do: 1 filled + 1 outline + 1 ghost button · Don't: 3 filled buttons side by side
- [ ] What is someone trying to finish here?
- [ ] Can someone who wants to cancel find that option?
- [ ] Is there a reason to recommend one of these choices?
- Reasoning: `references/rules/comp-1.md`

## Confirm irreversible deletion (`comp-2`)

Match the safeguard to the loss. Let people recover a reversible removal. Before permanent deletion, identify what will disappear and ask for an explicit decision.

- Do: Secondary “Delete project…” → red confirm · Don't: Red “Delete” in the row, no confirm
- [ ] Whose data changes?
- [ ] Could the confirmation be mistaken for a harmless removal?
- [ ] Can someone back out using only the keyboard?
- Reasoning: `references/rules/comp-2.md`

## Align nested corner radii (`comp-3`)

For circular corners with an even inset, subtract the distance between the two painted edges from the outer radius. An outer radius of 12px and an 8px inset leave an inner radius of 4px.

- Do: Outer 12px = Inner 4px + Inset 8px · Don't: Outer 4px and inner 4px with an 8px inset
- [ ] Which two edges should track each other?
- [ ] Has the border been included in their separation?
- [ ] Does the corner still read as an even inset at the smallest component size?
- Reasoning: `references/rules/comp-3.md`

## Distinguish people from content (`comp-4`)

Use a consistent shape for person avatars in mixed lists. A circular portrait beside a rectangular document thumbnail gives readers an extra cue about what each row represents.

- Do: Avatar = circle, file = rectangle · Don't: Avatar = square, file = rectangle
- [ ] Can a reader distinguish a person from a file without recognizing the photo?
- [ ] How does a team avatar differ from an individual in this system?
- [ ] Does a missing image preserve the same identity cue?
- Reasoning: `references/rules/comp-4.md`

## Choose a surface for the task (`comp-5`)

Use a modal when the current decision needs exclusive attention. Use a side panel when the surrounding page helps someone compare or edit information. Choose a full page if either surface would leave too little working room.

- Do: Profile editor beside the visible record · Don't: Six profile fields in a one-row modal viewport
- [ ] Can the user see the information needed to finish?
- [ ] Can they interact with the underlying page when the task calls for it?
- [ ] Would a dedicated page give a complex task a clearer sequence?
- Reasoning: `references/rules/comp-5.md`

## Place field errors beside the field (`comp-6`)

Identify the field and explain how to fix it where the user can make the change. After submission, a linked error summary can also help people find several errors.

- Do: Invalid email = inline, under the field · Don't: Invalid email = toast, far from the field
- [ ] Can someone find the field from the summary?
- [ ] Does the message explain a correction the user can actually make?
- [ ] Can someone returning to the field still read the error?
- Reasoning: `references/rules/comp-6.md`

## Label ambiguous actions (`comp-7`)

Add visible text when an icon leaves the action open to interpretation. Give every icon-only button an accessible name that describes what it does.

- Do: Icon + label on every toolbar action · Don't: Icon only on every toolbar action
- [ ] What else might this glyph mean in this context?
- [ ] Can someone identify the action without hover?
- [ ] Does the accessible name match the visible action?
- Reasoning: `references/rules/comp-7.md`

## Explain unavailable actions (`comp-8`)

When someone might reasonably try an unavailable action, explain the prerequisite beside it. A disabled button alone gives no indication of what to do next.

- Do: Disabled + reason under the button · Don't: Disabled + no reason
- [ ] Is the cause apparent before trying the control?
- [ ] Does the explanation say what can change the state?
- [ ] Can keyboard and touch users find it?
- Reasoning: `references/rules/comp-8.md`

## Acknowledge a pending submission (`comp-9`)

Acknowledge a submission while it is pending and prevent accidental repeats. Keep “Saving” distinct from “Saved” until the service confirms the result.

- Do: Spinner + disabled during submit · Don't: Static button allows double-click
- [ ] Does the user know the request is still pending?
- [ ] Can a retry create the same order twice?
- [ ] Can someone recover after a timeout without re-entering the form?
- Reasoning: `references/rules/comp-9.md`

## Match icon scale within a toolbar (`comp-10`)

Use a shared icon size for controls with equal roles. Check their apparent weight at the actual toolbar size and size the hit areas independently.

- Do: All toolbar icons: 20px · Don't: Mixed 16px, 20px, 24px icons in toolbar
- [ ] Which actions belong to the same group?
- [ ] Does one glyph dominate without a reason?
- [ ] Can the button remain easy to hit even when the drawing is small?
- Reasoning: `references/rules/comp-10.md`

## Size a card’s primary link (`comp-11`)

A card with one destination can offer a generous link target. On a card with multiple actions, give each an independent target and preserve text selection where readers need it.

- Do: Single-destination card with a card-sized target · Don't: Card looks clickable, only its title responds
- [ ] Does the visual affordance agree with the clickable area?
- [ ] Can each secondary action be operated independently?
- [ ] Can readers select text that they may need to copy?
- Reasoning: `references/rules/comp-11.md`

## Make overlay dismissal discoverable (`comp-12`)

Give dismissible dialogs a visible Close or Cancel action and support Escape. Choose outside-click behavior according to the cost of an accidental dismissal.

- Do: X button + backdrop close + Esc key · Don't: No close button, only backdrop click
- [ ] Can a keyboard user discover how to leave?
- [ ] What happens to an unsaved edit after Escape or a backdrop click?
- [ ] Where does focus land after dismissal?
- Reasoning: `references/rules/comp-12.md`

## Make the chart’s question answerable in text (`comp-13`)

Identify what the chart shows and describe the comparison readers need. When the task calls for individual values, offer them in a labeled table or another accessible representation that follows the selected period.

- Do: Summarize the trend and offer the monthly counts · Don't: Leave the trend and counts in the bars alone
- [ ] With the bars hidden, which queue grew over the selected period?
- [ ] Can a reader find March’s billing count and identify its unit using the table headers?
- [ ] After changing the quarter, do the plotted values, summary and table still agree?
- Reasoning: `references/rules/comp-13.md`

## Navigate with links, act with buttons (`comp-14`)

If activating a control takes someone to another URL, make it a link with an href, however it is styled. The browser then offers Open in new tab and Copy link, and shows the address before the click. Keep buttons for actions that change something on the current page.

- Do: <a href="/invoices/1042">View invoice</a> · Don't: <div onClick={() => router.push(…)}>
- [ ] Right-click the control. Does the menu offer Open link in new tab and Copy link address?
- [ ] Hover the control, then Cmd-click or middle-click it. Does the status bar show the destination, and does a new tab open while this page stays where it was?
- [ ] Does anything styled as a button change the URL, or anything styled as a link only change the current page?
- Reasoning: `references/rules/comp-14.md`

## Show the product doing what the headline promises (`comp-15`)

When a page makes a product claim, show the product delivering it: a crop of the real interface or output at the moment the headline describes. A reader should be able to point at the proof in the image without reading further. Decorative art that would fit any product's headline proves nothing.

- Do: Headline + deploy #418 flagged in the product · Don't: Headline + floating avatars and a green check
- [ ] Cover the headline. What does the image alone show the product doing?
- [ ] Swap a competitor’s name into the headline. Does the image still fit? If so, it proves nothing.
- [ ] Point to the exact spot in the image that delivers the headline’s promise. Can someone else find it at the size the image ships?
- Reasoning: `references/rules/comp-15.md`
