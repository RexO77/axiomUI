# Components & actions checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Prioritize the next action (`comp-1`)

Give the next step the only filled button in its group. Give equally important choices the same style.

- Do: 1 filled + 1 outline + 1 ghost button · Don’t: 3 filled buttons side by side
- [ ] What is someone trying to finish here?
- [ ] Can readers find Discard when they want to abandon their edits?
- [ ] Is there a reason to recommend one of these choices?
- Reasoning: `references/rules/comp-1.md`

## Confirm irreversible deletion (`comp-2`)

Offer Undo or a way to restore the item. Before permanent deletion, name what people will lose and ask them to confirm.

- Do: “Delete project…” opens a confirmation naming atlas-api · Don’t: “Delete” removes the project immediately
- [ ] Whose data changes?
- [ ] Could the confirmation be mistaken for a harmless removal?
- [ ] Can someone back out using only the keyboard?
- Reasoning: `references/rules/comp-2.md`

## Align nested corner radii (`comp-3`)

For circular corners with an even inset, subtract the inset from the outer radius. Measure between painted edges, including the border. With a 12px outer radius and an 8px inset, the inner radius is 4px.

- Do: Outer 12px = Inner 4px + Inset 8px · Don’t: Outer 4px and inner 4px with an 8px inset
- [ ] Which two edges should track each other?
- [ ] Did you include the border in the inset?
- [ ] Does the corner still read as an even inset at the smallest component size?
- Reasoning: `references/rules/comp-3.md`

## Distinguish people from content (`comp-4`)

In a list of people and files, use circles for people and rectangles for files. Readers can tell the rows apart before reading their names.

- Do: Initials in a circle, file icon in a rounded square · Don’t: Initials and file icon both in rounded squares
- [ ] Can a reader distinguish a person from a file without recognizing the photo?
- [ ] How does a team avatar differ from an individual in this system?
- [ ] Does a missing image preserve the same identity cue?
- Reasoning: `references/rules/comp-4.md`

## Choose a dialog, side panel or full page (`comp-5`)

Use a modal dialog for a decision that needs full attention. Use a side panel when people need the page beside the form. Give the task a full page when it needs more room.

- Do: All six profile fields visible beside the record · Don’t: Only one of six profile fields fully visible
- [ ] Can the user see the information needed to finish?
- [ ] Can they interact with the underlying page when the task calls for it?
- [ ] Would a full page give this task enough room?
- Reasoning: `references/rules/comp-5.md`

## Show each error under its field (`comp-6`)

At the field, say what went wrong and how to fix it. If submission reveals several errors, link to each field from a summary at the top.

- Do: Invalid email = inline, under the field · Don’t: Invalid email = toast, far from the field
- [ ] Can someone find the field from the summary?
- [ ] Does the message explain a correction the user can actually make?
- [ ] Can someone returning to the field still read the error?
- Reasoning: `references/rules/comp-6.md`

## Label ambiguous actions (`comp-7`)

Add a visible label when an icon’s meaning is unclear. Give every icon-only button an accessible name that says what it does.

- Do: Archive, Share and Delete with text labels · Don’t: Archive, Share and Delete as icons alone
- [ ] What else could this icon mean here?
- [ ] Can someone identify the action without hover?
- [ ] Does the accessible name match the visible action?
- Reasoning: `references/rules/comp-7.md`

## Explain unavailable actions (`comp-8`)

When people are likely to try a disabled control, explain beside it what would make it available.

- Do: “Available on the Pro plan” below Export CSV · Don’t: Disabled + no reason
- [ ] Is the cause apparent before trying the control?
- [ ] Does the explanation say what can change the state?
- [ ] Can keyboard and touch users find it?
- Reasoning: `references/rules/comp-8.md`

## Show when a submission is in progress (`comp-9`)

Show when a submission starts and block repeats while it’s pending. Show “Saved” only after the server confirms success.

- Do: Submit dims and a spinner replaces its label · Don’t: Submit briefly shrinks, then looks ready again
- [ ] Does the user know the request is still pending?
- [ ] Can a retry create the same order twice?
- [ ] Can someone recover after a timeout without re-entering the form?
- Reasoning: `references/rules/comp-9.md`

## Match the size of related toolbar icons (`comp-10`)

Start related icons at the same size. Check their visual weight in the toolbar and size the buttons’ hit areas separately.

- Do: All toolbar icons: 20px · Don’t: 16px, 20px and 24px icons in one toolbar
- [ ] Which actions belong to the same group?
- [ ] Does one glyph dominate without a reason?
- [ ] Can the button remain easy to hit even when the drawing is small?
- Reasoning: `references/rules/comp-10.md`

## Make a one-link card clickable throughout (`comp-11`)

When a card has one destination, let the whole card open it. Give additional actions their own targets and keep text selectable where readers need to copy it.

- Do: The whole card links to the article · Don’t: Only the article title is clickable
- [ ] Can readers click anywhere the card looks clickable?
- [ ] Can each secondary action be operated independently?
- [ ] Can readers select text that they may need to copy?
- Reasoning: `references/rules/comp-11.md`

## Show how to close a dialog (`comp-12`)

Give dismissible dialogs a visible Close or Cancel button and support Escape. Allow a click outside to close the dialog when closing it loses no work.

- Do: Close button, Escape or click outside · Don’t: No close button, only backdrop click
- [ ] Can a keyboard user discover how to leave?
- [ ] What happens to an unsaved edit after Escape or a backdrop click?
- [ ] Where does focus land after dismissal?
- Reasoning: `references/rules/comp-12.md`

## State the chart’s main finding in words (`comp-13`)

Name what the chart measures and summarize the main comparison. When exact values matter, make them available in a labeled table or another accessible format. Update both with the selected period.

- Do: Trend in words, monthly counts in the interactive example · Don’t: Bars without a written summary or counts table
- [ ] With the bars hidden, which queue grew over the selected period?
- [ ] With January through March selected, can readers find March’s Billing count and tell it represents tickets?
- [ ] After changing the quarter, do the plotted values, summary and table still agree?
- Reasoning: `references/rules/comp-13.md`

## Navigate with links, act with buttons (`comp-14`)

Use a link with an href to open a destination. People can then copy its address or open it in another tab. Use a button to perform an action, even if it redirects afterward.

- Do: `<a href="/invoices/1042">View invoice</a>` · Don’t: `<div onClick={() => router.push(…)}>`
- [ ] Right-click the control. Does the menu offer Open link in new tab and Copy link address?
- [ ] Does hovering show the invoice address? Can you open it in another tab with Command-click on macOS, Ctrl-click on Windows or Linux, or a middle click?
- [ ] Does “View invoice” expose a link to the invoice? Does “Save” submit the changes before leaving the page?
- Reasoning: `references/rules/comp-14.md`

## Show the product doing what the headline promises (`comp-15`)

Show the screen or output that delivers the headline’s claim. Crop it so the result is easy to see at the size the image appears.

- Do: Headline + deploy #418 flagged in the product · Don’t: Headline + floating avatars and a green check
- [ ] Cover the headline. What does the image alone show the product doing?
- [ ] Swap a competitor’s name into the headline. Does the image still fit? If so, it proves nothing.
- [ ] At the smallest display size, can readers identify the flagged deploy and read the change in checkout errors?
- Reasoning: `references/rules/comp-15.md`
