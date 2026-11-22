# System & logic checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Choose a loading state that explains the wait (`sys-1`)

Use a skeleton when you know the layout. Show a progress bar when you can measure the work completed. Use a spinner when all you can say is that work is underway.

- Do: Skeleton shaped like the incoming content · Don’t: Spinner replaces the whole content area
- [ ] When the content arrives, does it fit the space the skeleton reserved?
- [ ] Can someone keep using content that has already loaded?
- [ ] What appears if the request fails or returns no records?
- Reasoning: `references/rules/sys-1.md`

## Explain why a view is empty (`sys-2`)

Say why the view is empty. If someone can create a first project or clear a search filter, offer that action.

- Do: “No projects yet” + “New project” button · Don’t: Blank panel · no message or action
- [ ] Which state produced the empty view?
- [ ] Can this person actually perform the suggested action?
- [ ] Would a message alone be sufficient?
- Reasoning: `references/rules/sys-2.md`

## Give small icons a larger hit area (`sys-3`)

Size the hit area separately from the icon. Aim for 44 × 44 CSS pixels on touch. WCAG 2.2 AA requires at least 24 × 24 CSS pixels unless an exception applies.

- Do: 44 × 44px hit area · Don’t: 16 × 16px hit area
- [ ] Where does the click actually land around the glyph?
- [ ] Does an adjacent action overlap its target?
- [ ] Can someone reliably hit it on the intended input devices?
- Reasoning: `references/rules/sys-3.md`

## Use relative time for activity, dates for records (`sys-4`)

Use relative time to show how recent an event is. For a record, show the date or time in the reader's locale. If a relative label needs an exact time, make it available by touch and keyboard.

- Do: Activity: 2m ago · Don’t: Activity: 2026-08-10T14:02:11Z
- [ ] Is the task about recency or a specific point in time?
- [ ] Which time zone determines the displayed date?
- [ ] Can someone obtain the exact time without a mouse?
- Reasoning: `references/rules/sys-4.md`

## Reference colors by role, not by value (`sys-5`)

Give text, surfaces and warnings separate color roles. Set their values per theme so text stays readable and a button can change color independently of a warning.

- Do: var(--text) → #f5f5f5 on #262626 (13.9:1) · Don’t: #0f172a on #262626 (1.2:1)
- [ ] When you switch themes, can you still read the text and recognize the icons against their backgrounds?
- [ ] Which role does this component request, and can the warning change without the action changing with it?
- [ ] Does the invoice text have at least 4.5:1 contrast against its card in every theme?
- Reasoning: `references/rules/sys-5.md`

## Let people restore deleted items (`sys-6`)

Offer Undo when an item moves to Trash. Keep it recoverable from Trash after the message closes. Ask for confirmation before a consequential deletion that cannot reliably be undone.

- Do: Moved to Trash with immediate Undo · Don’t: Permanently deleted · no Undo
- [ ] Can the item be restored after the notice vanishes?
- [ ] Do restored content and access match their prior state?
- [ ] Does the user know when deletion becomes permanent?
- Reasoning: `references/rules/sys-6.md`

## Show the current step in a multi-step flow (`sys-7`)

For a fixed sequence, show the current step and how many remain. If answers can add or skip steps, show the step names without a fixed total.

- Do: Step 2 of 4 · Don’t: No progress indicator
- [ ] Can the person identify the current task?
- [ ] Does the stated total remain accurate on each branch?
- [ ] Can they review an earlier answer without losing later work?
- Reasoning: `references/rules/sys-7.md`

## Use the keys people expect for each control (`sys-8`)

Make every task usable by keyboard. Use native controls where possible. Tab moves between controls, arrow keys move within groups such as tabs and radio buttons, and Escape closes a modal dialog.

- Do: Tab moves focus · Enter activates · Esc dismisses · Don’t: Tab skips Archive · Esc does nothing
- [ ] Can the task be completed end to end without a pointer?
- [ ] Which keys does this control’s role lead users to expect?
- [ ] After dismissal, can the person continue from a sensible location?
- Reasoning: `references/rules/sys-8.md`

## Show changes before the server confirms them (`sys-9`)

For a low-risk action like liking a post, show the change immediately. If saving fails, say so and show the last confirmed state. If someone taps again, keep their latest choice when earlier replies arrive.

- Do: Heart starts filling at 0ms · Synced starts appearing at 700ms · Don’t: Spinner until the heart starts filling at 560ms
- [ ] Is the action low-risk and reversible enough to show before the server confirms it?
- [ ] If someone taps twice, can a late reply undo their second tap?
- [ ] Can the person tell what was actually saved after failure?
- Reasoning: `references/rules/sys-9.md`

## Contain a failure to the part that failed (`sys-10`)

Keep the content that loaded. Say which part failed and offer Retry there, or another way to continue.

- Do: Image keeps its space · Reload image · Don’t: Broken image icon and hero@2x.jpg · article title shifts up
- [ ] What information does the missing resource carry?
- [ ] Can the rest of the task continue safely?
- [ ] Is another attempt likely to help, and is it safe to repeat?
- Reasoning: `references/rules/sys-10.md`

## Keep the task usable at 320 CSS pixels (`sys-11`)

Set the viewport to 320 CSS pixels, or start at 1280px and zoom to 400%. Complete the main task without scrolling the page sideways. Let a table, map or code block scroll separately if its layout is essential.

- Do: 320px: fields stack · Continue in view · Don’t: 320px: min-width 512px · Continue off-screen
- [ ] At 320 CSS pixels, does `document.documentElement.scrollWidth` equal the viewport width?
- [ ] Zoom a 1280px viewport to 400% and complete the main task. Do you have to scroll the page sideways?
- [ ] Which element sets the overflowing width, and does it need that width?
- Reasoning: `references/rules/sys-11.md`

## Limit transitions to intended properties (`sys-13`)

List the CSS properties you want to animate. With transition: all, setting a new button width can animate that change too.

- Do: transition-property: scale, background-color · Don’t: transition: all 150ms ease-out
- [ ] Which properties should animate, and are those the only ones listed?
- [ ] Does an unrelated explicit width change stretch the control?
- [ ] When the button changes width, do neighboring controls move straight to their final positions?
- Reasoning: `references/rules/sys-13.md`

## Return people to the result they opened (`sys-15`)

Back should return to the same scroll position with the item in view. Keep the search, filters, sort and page in the URL so a refresh or shared link restores the same results.

- Do: Back → Overdue · sorted by due date · row 37 · Don’t: Back → All invoices · top of the list
- [ ] Filter the list, sort it, scroll down, open row 37 and press Back. Is row 37 in view with the same filter and sort?
- [ ] Open the filtered list’s URL in a new tab. Do the search, filters, sort and page match?
- [ ] Start on another page, open the list, change the filter three times and open an item. Does Back return to the filtered list, then to the starting page?
- Reasoning: `references/rules/sys-15.md`

## Keep errors and the only recovery action on screen (`sys-16`)

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause the timer while the pointer is over the message, focus is inside it, or the tab is hidden.

- Do: Upload failed · stays until Retry or dismissal · Don’t: Upload failed · message closes at 5s · Retry disappears
- [ ] Trigger the failure, then wait ten seconds without touching anything. Are the error and Retry still on screen?
- [ ] Show a timed confirmation. Does it stay visible past its timeout while the pointer rests on it? Repeat with keyboard focus on an action.
- [ ] Show a timed confirmation and switch tabs for a minute. When you return, is the message still there for its full timeout?
- Reasoning: `references/rules/sys-16.md`
