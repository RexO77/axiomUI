# Components & actions

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Action hierarchy (`comp-1`)

Give a screen one primary action and demote the rest to outline or text-link styling. Two equally loud buttons make the user choose before they have understood the choice.

- Do: 1 filled + 1 outline + 1 ghost button
- Don't: 3 filled buttons side by side
- Reasoning: `references/rules/comp-1.md` · https://axiomui.nischal.fyi/rules/comp-1

## Destructive actions (`comp-2`)

Keep Delete secondary. For permanent deletes, confirm in a modal with a red button; when the delete can be undone, skip the modal and offer an undo toast instead.

- Do: Secondary “Delete project…” → red confirm
- Don't: Red “Delete” in the row, no confirm
- Reasoning: `references/rules/comp-2.md` · https://axiomui.nischal.fyi/rules/comp-2

## Nested radius formula (`comp-3`)

Outer Radius = Inner Radius + Padding. This makes concentric corners look mathematically parallel.

- Do: Outer 12px = Inner 4px + Padding 8px
- Don't: Outer 4px = Inner 4px (padding ignored)
- Reasoning: `references/rules/comp-3.md` · https://axiomui.nischal.fyi/rules/comp-3

## Avatars are circles (`comp-4`)

Put people in circles and content in rectangles. The shape becomes a type signal, so a mixed list of avatars and files can be scanned without reading a single label.

- Do: Avatar = circle, file = rectangle
- Don't: Avatar = square, file = rectangle
- Reasoning: `references/rules/comp-4.md` · https://axiomui.nischal.fyi/rules/comp-4

## Modal vs drawer (`comp-5`)

Use a modal for one short, focused decision; use a drawer for a context-heavy task where the user needs to keep seeing what sits behind it.

- Do: 1 decision = modal, 6 fields = drawer
- Don't: 1 decision = modal, 6 fields = modal
- Reasoning: `references/rules/comp-5.md` · https://axiomui.nischal.fyi/rules/comp-5

## Toast vs inline error (`comp-6`)

Toasts are for system-level news (saved, disconnected); inline errors are for a field the user has to fix. An error has to appear where the fix happens, because a toast is gone before they get there.

- Do: Invalid email = inline, under the field
- Don't: Invalid email = toast, far from the field
- Reasoning: `references/rules/comp-6.md` · https://axiomui.nischal.fyi/rules/comp-6

## Icon + label for ambiguous actions (`comp-7`)

Icons are only universal for a few actions. Add labels for everything else to avoid guesswork.

- Do: Icon + label on every toolbar action
- Don't: Icon only on every toolbar action
- Reasoning: `references/rules/comp-7.md` · https://axiomui.nischal.fyi/rules/comp-7

## Disabled needs a reason (`comp-8`)

Disabled controls without explanation feel broken. Add a tooltip or helper text.

- Do: Disabled + reason under the button
- Don't: Disabled + no reason
- Reasoning: `references/rules/comp-8.md` · https://axiomui.nischal.fyi/rules/comp-8

## Loading states on buttons (`comp-9`)

Buttons that trigger async actions should show a spinner/loading state and disable re-click. Never leave a button looking clickable during submission.

- Do: Spinner + disabled during submit
- Don't: Static button allows double-click
- Reasoning: `references/rules/comp-9.md` · https://axiomui.nischal.fyi/rules/comp-9

## Consistent icon size (`comp-10`)

Icons in the same context should be the same size. Don't mix 16px and 20px icons in the same toolbar or nav.

- Do: All toolbar icons: 20px
- Don't: Mixed 16px, 20px, 24px icons in toolbar
- Reasoning: `references/rules/comp-10.md` · https://axiomui.nischal.fyi/rules/comp-10

## Card click area (`comp-11`)

If a card is clickable, the entire card should be the click target, not just the title or a tiny link inside it.

- Do: Hit area: 100% of the card
- Don't: Hit area: 16% (title text only)
- Reasoning: `references/rules/comp-11.md` · https://axiomui.nischal.fyi/rules/comp-11

## Close affordance on overlays (`comp-12`)

Every modal, drawer, and popover needs a visible close button AND should close on backdrop click and Escape key.

- Do: X button + backdrop close + Esc key
- Don't: No close button, only backdrop click
- Reasoning: `references/rules/comp-12.md` · https://axiomui.nischal.fyi/rules/comp-12
