# System & logic checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Choose a loading state that explains the wait (`sys-1`)

- Do: Skeleton shaped like the incoming content · Don't: Spinner replaces the whole content area
- [ ] Does the loading treatment accurately describe what is known?
- [ ] Can someone keep using content that has already loaded?
- [ ] What appears if the request fails or returns no records?
- Reasoning: `references/rules/sys-1.md`

## Explain why a view is empty (`sys-2`)

- Do: “No projects yet” + “New project” button · Don't: Empty panel, no next step
- [ ] Which state produced the empty view?
- [ ] Can this person actually perform the suggested action?
- [ ] Would a message alone be sufficient?
- Reasoning: `references/rules/sys-2.md`

## Size the hit area for the input (`sys-3`)

- Do: 44x44px hit area · Don't: 16x16px hit area
- [ ] Where does the click actually land around the glyph?
- [ ] Does an adjacent action overlap its target?
- [ ] Can someone reliably hit it on the intended input devices?
- Reasoning: `references/rules/sys-3.md`

## Choose a timestamp for the question (`sys-4`)

- Do: Activity: 2m ago · Don't: Activity: yyyy-mm-ddThh:mm:ssZ
- [ ] Is the task about recency or a specific point in time?
- [ ] Which time zone determines the displayed date?
- [ ] Can someone obtain the exact time without a mouse?
- Reasoning: `references/rules/sys-4.md`

## Give shared colors semantic roles (`sys-5`)

- Do: blue-500 (palette) → accent (alias) → component · Don't: $button-blue → component
- [ ] What intent does this component request?
- [ ] Can the warning change without changing the action?
- [ ] Do aliases resolve to legible pairs in every theme?
- Reasoning: `references/rules/sys-5.md`

## Make reversible deletion recoverable (`sys-6`)

- Do: Moved to Trash with immediate Undo · Don't: Deleted → gone, no undo
- [ ] Can the item be restored after the notice vanishes?
- [ ] Do restored content and access match their prior state?
- [ ] Does the user know when deletion becomes permanent?
- Reasoning: `references/rules/sys-6.md`

## Orient people in a multi-step flow (`sys-7`)

- Do: Step 2 of 4 · Don't: No progress indicator
- [ ] Can the person identify the current task?
- [ ] Does the stated total remain accurate on each branch?
- [ ] Can they review an earlier answer without losing later work?
- Reasoning: `references/rules/sys-7.md`

## Follow the keyboard model for each control (`sys-8`)

- Do: Tab → Enter → Esc flow works · Don't: Click-only interactions, no keyboard support
- [ ] Can the task be completed end to end without a pointer?
- [ ] Which keys does this control’s role lead users to expect?
- [ ] After dismissal, can the person continue from a sensible location?
- Reasoning: `references/rules/sys-8.md`

## Reconcile optimistic changes (`sys-9`)

- Do: Heart fills instantly, syncs async · Don't: Spinner on every like button click
- [ ] Is the result safe to predict?
- [ ] Does a rapid second action survive a late response?
- [ ] Can the person tell what was actually saved after failure?
- Reasoning: `references/rules/sys-9.md`

## Recover at the point of failure (`sys-10`)

- Do: Placeholder image + retry option · Don't: Broken image icon / blank screen
- [ ] What information does the missing resource carry?
- [ ] Can the rest of the task continue safely?
- [ ] Is another attempt likely to help, and is it safe to repeat?
- Reasoning: `references/rules/sys-10.md`

## Set breakpoints where the layout needs them (`sys-11`)

- Do: 2 breakpoints: 640px / 1024px (3 tiers) · Don't: 8 breakpoints, one per device
- [ ] What breaks immediately before this change?
- [ ] Does the layout recover on both sides of the threshold?
- [ ] Does an embedded instance still work in a narrower parent?
- Reasoning: `references/rules/sys-11.md`

## Limit transitions to intended properties (`sys-13`)

- Do: transition-property: scale, background-color · Don't: transition: all 150ms ease-out
- [ ] Which computed values are intended to interpolate?
- [ ] Does an unrelated explicit width change stretch the control?
- [ ] Does the rest of the interface settle as expected?
- Reasoning: `references/rules/sys-13.md`

## Use will-change sparingly (`sys-14`)

- Do: will-change: transform, opacity on one measured card · Don't: will-change: transform, opacity on every card
- [ ] Which trace identifies the problem?
- [ ] Does this hint improve that interaction on the target device?
- [ ] How many elements retain the hint when idle?
- Reasoning: `references/rules/sys-14.md`
