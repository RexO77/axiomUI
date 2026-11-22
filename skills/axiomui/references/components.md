# Components & actions

Compact Do/Don’t for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Prioritize the next action (`comp-1`)

Give the next step the only filled button in its group. Give equally important choices the same style.

- Do: 1 filled + 1 outline + 1 ghost button
- Don’t: 3 filled buttons side by side
- Reasoning: `references/rules/comp-1.md` · https://axiomui.nischal.fyi/rules/comp-1

## Confirm irreversible deletion (`comp-2`)

Offer Undo or a way to restore the item. Before permanent deletion, name what people will lose and ask them to confirm.

- Do: “Delete project…” opens a confirmation naming atlas-api
- Don’t: “Delete” removes the project immediately
- Reasoning: `references/rules/comp-2.md` · https://axiomui.nischal.fyi/rules/comp-2

## Align nested corner radii (`comp-3`)

For circular corners with an even inset, subtract the inset from the outer radius. Measure between painted edges, including the border. With a 12px outer radius and an 8px inset, the inner radius is 4px.

- Do: Outer 12px = Inner 4px + Inset 8px
- Don’t: Outer 4px and inner 4px with an 8px inset
- Reasoning: `references/rules/comp-3.md` · https://axiomui.nischal.fyi/rules/comp-3

## Distinguish people from content (`comp-4`)

In a list of people and files, use circles for people and rectangles for files. Readers can tell the rows apart before reading their names.

- Do: Initials in a circle, file icon in a rounded square
- Don’t: Initials and file icon both in rounded squares
- Reasoning: `references/rules/comp-4.md` · https://axiomui.nischal.fyi/rules/comp-4

## Choose a dialog, side panel or full page (`comp-5`)

Use a modal dialog for a decision that needs full attention. Use a side panel when people need the page beside the form. Give the task a full page when it needs more room.

- Do: All six profile fields visible beside the record
- Don’t: Only one of six profile fields fully visible
- Reasoning: `references/rules/comp-5.md` · https://axiomui.nischal.fyi/rules/comp-5

## Show each error under its field (`comp-6`)

At the field, say what went wrong and how to fix it. If submission reveals several errors, link to each field from a summary at the top.

- Do: Invalid email = inline, under the field
- Don’t: Invalid email = toast, far from the field
- Reasoning: `references/rules/comp-6.md` · https://axiomui.nischal.fyi/rules/comp-6

## Label ambiguous actions (`comp-7`)

Add a visible label when an icon’s meaning is unclear. Give every icon-only button an accessible name that says what it does.

- Do: Archive, Share and Delete with text labels
- Don’t: Archive, Share and Delete as icons alone
- Reasoning: `references/rules/comp-7.md` · https://axiomui.nischal.fyi/rules/comp-7

## Explain unavailable actions (`comp-8`)

When people are likely to try a disabled control, explain beside it what would make it available.

- Do: “Available on the Pro plan” below Export CSV
- Don’t: Disabled + no reason
- Reasoning: `references/rules/comp-8.md` · https://axiomui.nischal.fyi/rules/comp-8

## Show when a submission is in progress (`comp-9`)

Show when a submission starts and block repeats while it’s pending. Show “Saved” only after the server confirms success.

- Do: Submit dims and a spinner replaces its label
- Don’t: Submit briefly shrinks, then looks ready again
- Reasoning: `references/rules/comp-9.md` · https://axiomui.nischal.fyi/rules/comp-9

## Match the size of related toolbar icons (`comp-10`)

Start related icons at the same size. Check their visual weight in the toolbar and size the buttons’ hit areas separately.

- Do: All toolbar icons: 20px
- Don’t: 16px, 20px and 24px icons in one toolbar
- Reasoning: `references/rules/comp-10.md` · https://axiomui.nischal.fyi/rules/comp-10

## Make a one-link card clickable throughout (`comp-11`)

When a card has one destination, let the whole card open it. Give additional actions their own targets and keep text selectable where readers need to copy it.

- Do: The whole card links to the article
- Don’t: Only the article title is clickable
- Reasoning: `references/rules/comp-11.md` · https://axiomui.nischal.fyi/rules/comp-11

## Show how to close a dialog (`comp-12`)

Give dismissible dialogs a visible Close or Cancel button and support Escape. Allow a click outside to close the dialog when closing it loses no work.

- Do: Close button, Escape or click outside
- Don’t: No close button, only backdrop click
- Reasoning: `references/rules/comp-12.md` · https://axiomui.nischal.fyi/rules/comp-12

## State the chart’s main finding in words (`comp-13`)

Name what the chart measures and summarize the main comparison. When exact values matter, make them available in a labeled table or another accessible format. Update both with the selected period.

- Do: Trend in words, monthly counts in the interactive example
- Don’t: Bars without a written summary or counts table
- Reasoning: `references/rules/comp-13.md` · https://axiomui.nischal.fyi/rules/comp-13

## Navigate with links, act with buttons (`comp-14`)

Use a link with an href to open a destination. People can then copy its address or open it in another tab. Use a button to perform an action, even if it redirects afterward.

- Do: `<a href="/invoices/1042">View invoice</a>`
- Don’t: `<div onClick={() => router.push(…)}>`
- Reasoning: `references/rules/comp-14.md` · https://axiomui.nischal.fyi/rules/comp-14

## Show the product doing what the headline promises (`comp-15`)

Show the screen or output that delivers the headline’s claim. Crop it so the result is easy to see at the size the image appears.

- Do: Headline + deploy #418 flagged in the product
- Don’t: Headline + floating avatars and a green check
- Reasoning: `references/rules/comp-15.md` · https://axiomui.nischal.fyi/rules/comp-15
