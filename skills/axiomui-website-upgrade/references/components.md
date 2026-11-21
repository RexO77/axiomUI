# Components & actions

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Prioritize the next action (`comp-1`)

Give the next step in a task the strongest button treatment. When two choices deserve equal consideration, give them equal weight.

- Do: 1 filled + 1 outline + 1 ghost button
- Don't: 3 filled buttons side by side
- Reasoning: `references/rules/comp-1.md` · https://axiomui.nischal.fyi/rules/comp-1

## Confirm irreversible deletion (`comp-2`)

Match the safeguard to the loss. Let people recover a reversible removal. Before permanent deletion, identify what will disappear and ask for an explicit decision.

- Do: Secondary “Delete project…” → red confirm
- Don't: Red “Delete” in the row, no confirm
- Reasoning: `references/rules/comp-2.md` · https://axiomui.nischal.fyi/rules/comp-2

## Align nested corner radii (`comp-3`)

For circular corners with an even inset, subtract the distance between the two painted edges from the outer radius. An outer radius of 12px and an 8px inset leave an inner radius of 4px.

- Do: Outer 12px = Inner 4px + Inset 8px
- Don't: Outer 4px and inner 4px with an 8px inset
- Reasoning: `references/rules/comp-3.md` · https://axiomui.nischal.fyi/rules/comp-3

## Distinguish people from content (`comp-4`)

Use a consistent shape for person avatars in mixed lists. A circular portrait beside a rectangular document thumbnail gives readers an extra cue about what each row represents.

- Do: Avatar = circle, file = rectangle
- Don't: Avatar = square, file = rectangle
- Reasoning: `references/rules/comp-4.md` · https://axiomui.nischal.fyi/rules/comp-4

## Choose a surface for the task (`comp-5`)

Use a modal when the current decision needs exclusive attention. Use a side panel when the surrounding page helps someone compare or edit information. Choose a full page if either surface would leave too little working room.

- Do: Profile editor beside the visible record
- Don't: Six profile fields in a one-row modal viewport
- Reasoning: `references/rules/comp-5.md` · https://axiomui.nischal.fyi/rules/comp-5

## Place field errors beside the field (`comp-6`)

Identify the field and explain how to fix it where the user can make the change. After submission, a linked error summary can also help people find several errors.

- Do: Invalid email = inline, under the field
- Don't: Invalid email = toast, far from the field
- Reasoning: `references/rules/comp-6.md` · https://axiomui.nischal.fyi/rules/comp-6

## Label ambiguous actions (`comp-7`)

Add visible text when an icon leaves the action open to interpretation. Give every icon-only button an accessible name that describes what it does.

- Do: Icon + label on every toolbar action
- Don't: Icon only on every toolbar action
- Reasoning: `references/rules/comp-7.md` · https://axiomui.nischal.fyi/rules/comp-7

## Explain unavailable actions (`comp-8`)

When someone might reasonably try an unavailable action, explain the prerequisite beside it. A disabled button alone gives no indication of what to do next.

- Do: Disabled + reason under the button
- Don't: Disabled + no reason
- Reasoning: `references/rules/comp-8.md` · https://axiomui.nischal.fyi/rules/comp-8

## Acknowledge a pending submission (`comp-9`)

Acknowledge a submission while it is pending and prevent accidental repeats. Keep “Saving” distinct from “Saved” until the service confirms the result.

- Do: Spinner + disabled during submit
- Don't: Static button allows double-click
- Reasoning: `references/rules/comp-9.md` · https://axiomui.nischal.fyi/rules/comp-9

## Match icon scale within a toolbar (`comp-10`)

Use a shared icon size for controls with equal roles. Check their apparent weight at the actual toolbar size and size the hit areas independently.

- Do: All toolbar icons: 20px
- Don't: Mixed 16px, 20px, 24px icons in toolbar
- Reasoning: `references/rules/comp-10.md` · https://axiomui.nischal.fyi/rules/comp-10

## Size a card’s primary link (`comp-11`)

A card with one destination can offer a generous link target. On a card with multiple actions, give each an independent target and preserve text selection where readers need it.

- Do: Single-destination card with a card-sized target
- Don't: Card looks clickable, only its title responds
- Reasoning: `references/rules/comp-11.md` · https://axiomui.nischal.fyi/rules/comp-11

## Make overlay dismissal discoverable (`comp-12`)

Give dismissible dialogs a visible Close or Cancel action and support Escape. Choose outside-click behavior according to the cost of an accidental dismissal.

- Do: X button + backdrop close + Esc key
- Don't: No close button, only backdrop click
- Reasoning: `references/rules/comp-12.md` · https://axiomui.nischal.fyi/rules/comp-12

## Make the chart’s question answerable in text (`comp-13`)

Identify what the chart shows and describe the comparison readers need. When the task calls for individual values, offer them in a labeled table or another accessible representation that follows the selected period.

- Do: Summarize the trend and offer the monthly counts
- Don't: Leave the trend and counts in the bars alone
- Reasoning: `references/rules/comp-13.md` · https://axiomui.nischal.fyi/rules/comp-13

## Navigate with links, act with buttons (`comp-14`)

If activating a control takes someone to another URL, make it a link with an href, however it is styled. The browser then offers Open in new tab and Copy link, and shows the address before the click. Keep buttons for actions that change something on the current page.

- Do: <a href="/invoices/1042">View invoice</a>
- Don't: <div onClick={() => router.push(…)}>
- Reasoning: `references/rules/comp-14.md` · https://axiomui.nischal.fyi/rules/comp-14

## Show the product doing what the headline promises (`comp-15`)

When a page makes a product claim, show the product delivering it: a crop of the real interface or output at the moment the headline describes. A reader should be able to point at the proof in the image without reading further. Decorative art that would fit any product's headline proves nothing.

- Do: Headline + deploy #418 flagged in the product
- Don't: Headline + floating avatars and a green check
- Reasoning: `references/rules/comp-15.md` · https://axiomui.nischal.fyi/rules/comp-15
