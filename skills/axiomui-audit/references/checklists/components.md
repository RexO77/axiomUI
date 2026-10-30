# Components & actions checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## Action hierarchy (`comp-1`)

- Do: 1 filled + 1 outline + 1 ghost button · Don't: 3 filled buttons side by side
- [ ] Is there exactly one filled button visible on this screen?
- [ ] Are the remaining actions stepped down to outline and ghost rather than left filled?
- [ ] Does the filled button match the action most users should take next?
- Reasoning: `references/rules/comp-1.md`

## Destructive actions (`comp-2`)

- Do: Secondary “Delete project…” → red confirm · Don't: Red “Delete” in the row, no confirm
- [ ] Is the initial Delete… trigger styled as a secondary action rather than red?
- [ ] For a permanent delete, does clicking it open a confirmation step before anything is removed?
- [ ] Is red reserved for the confirming button inside the modal?
- Reasoning: `references/rules/comp-2.md`

## Nested radius formula (`comp-3`)

- Do: Outer 12px = Inner 4px + Padding 8px · Don't: Outer 4px = Inner 4px (padding ignored)
- [ ] Does the outer radius equal inner radius plus the padding between them?
- [ ] Do the nested corners look concentric rather than pinched?
- [ ] Was the radius recalculated after any recent padding change?
- Reasoning: `references/rules/comp-3.md`

## Avatars are circles (`comp-4`)

- Do: Avatar = circle, file = rectangle · Don't: Avatar = square, file = rectangle
- [ ] Is every user avatar displayed as a circle?
- [ ] Are document or project thumbnails shown as squares or rects, not circles?
- [ ] Is the circle-for-people rule applied consistently across the whole screen?
- Reasoning: `references/rules/comp-4.md`

## Modal vs drawer (`comp-5`)

- Do: 1 decision = modal, 6 fields = drawer · Don't: 1 decision = modal, 6 fields = modal
- [ ] Is this modal reserved for a short, single decision rather than a complex task?
- [ ] Does the drawer keep the background page visible while editing?
- [ ] Would this task feel cramped if forced into a small modal?
- Reasoning: `references/rules/comp-5.md`

## Toast vs inline error (`comp-6`)

- Do: Invalid email = inline, under the field · Don't: Invalid email = toast, far from the field
- [ ] Do system-level updates like save confirmations appear as toasts?
- [ ] Does the invalid email error show inline, next to the field itself?
- [ ] Is any field-specific error message sitting far from its field?
- Reasoning: `references/rules/comp-6.md`

## Icon + label for ambiguous actions (`comp-7`)

- Do: Icon + label on every toolbar action · Don't: Icon only on every toolbar action
- [ ] Does the archive action show both an icon and a text label?
- [ ] Is the toolbar free of icon-only buttons for non-universal actions?
- [ ] Could a first-time user name each icon’s action without hovering?
- Reasoning: `references/rules/comp-7.md`

## Disabled needs a reason (`comp-8`)

- Do: Disabled + reason under the button · Don't: Disabled + no reason
- [ ] Does this disabled control have a visible reason sitting next to it?
- [ ] Does that text name what the user must do to enable it?
- [ ] Can a keyboard user reach the control and find out why it is unavailable?
- Reasoning: `references/rules/comp-8.md`

## Loading states on buttons (`comp-9`)

- Do: Spinner + disabled during submit · Don't: Static button allows double-click
- [ ] Does the button show a spinner while the request is in flight?
- [ ] Is the button disabled during submission, so a second click cannot fire?
- [ ] Does the button return to its resting state on failure as well as on success?
- Reasoning: `references/rules/comp-9.md`

## Consistent icon size (`comp-10`)

- Do: All toolbar icons: 20px · Don't: Mixed 16px, 20px, 24px icons in toolbar
- [ ] Are all icons in this toolbar rendered at the same size?
- [ ] Is any icon in this toolbar a different size from the ones beside it?
- [ ] Does icon size stay consistent across this entire navigation context?
- Reasoning: `references/rules/comp-10.md`

## Card click area (`comp-11`)

- Do: Hit area: 100% of the card · Don't: Hit area: 16% (title text only)
- [ ] Does clicking anywhere on the card, not just the title, trigger navigation?
- [ ] Is there a hover state confirming the full card is the target?
- [ ] Do secondary links inside the card still work independently of the card click?
- Reasoning: `references/rules/comp-11.md`

## Close affordance on overlays (`comp-12`)

- Do: X button + backdrop close + Esc key · Don't: No close button, only backdrop click
- [ ] Is there a visible X button on this overlay?
- [ ] Does clicking the backdrop close the overlay?
- [ ] Does pressing Escape also close the overlay?
- Reasoning: `references/rules/comp-12.md`
