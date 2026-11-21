# System & logic checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Choose a loading state that explains the wait (`sys-1`)

Use a skeleton when the incoming layout is predictable. An indeterminate indicator fits an operation whose duration is unknown. Use measured progress when the amount of work completed is available.

- Do: Skeleton shaped like the incoming content · Don't: Spinner replaces the whole content area
- [ ] Does the loading treatment accurately describe what is known?
- [ ] Can someone keep using content that has already loaded?
- [ ] What appears if the request fails or returns no records?
- Reasoning: `references/rules/sys-1.md`

## Explain why a view is empty (`sys-2`)

Tell people what an empty view means. Offer a relevant next step when one exists, such as creating a first project or clearing a search filter.

- Do: “No projects yet” + “New project” button · Don't: Empty panel, no next step
- [ ] Which state produced the empty view?
- [ ] Can this person actually perform the suggested action?
- [ ] Would a message alone be sufficient?
- Reasoning: `references/rules/sys-2.md`

## Size the hit area for the input (`sys-3`)

Size the clickable area independently of the icon. A 44 × 44 CSS px target is a useful touch-friendly choice. WCAG 2.2 AA generally calls for 24 × 24 CSS px or a qualifying exception.

- Do: 44x44px hit area · Don't: 16x16px hit area
- [ ] Where does the click actually land around the glyph?
- [ ] Does an adjacent action overlap its target?
- [ ] Can someone reliably hit it on the intended input devices?
- Reasoning: `references/rules/sys-3.md`

## Choose a timestamp for the question (`sys-4`)

Use relative time when recency matters and a localized date or time when someone needs a record. Make the exact timestamp available on touch and keyboard when the distinction matters.

- Do: Activity: 2m ago · Don't: Activity: yyyy-mm-ddThh:mm:ssZ
- [ ] Is the task about recency or a specific point in time?
- [ ] Which time zone determines the displayed date?
- [ ] Can someone obtain the exact time without a mouse?
- Reasoning: `references/rules/sys-4.md`

## Reference colors by role, not by value (`sys-5`)

Have components ask for a role such as text, surface or warning, and resolve each role per theme. A literal value picked on the light theme stays put when the surface turns dark, and two features that share a hex by coincidence change together when one is restyled.

- Do: var(--text) → #f5f5f5 on #262626 (13.9:1) · Don't: #0f172a on #262626 (1.2:1)
- [ ] Switch the theme. Does any text or icon keep its light-theme color?
- [ ] Which role does this component request, and can the warning change without the action changing with it?
- [ ] Do the resolved pairs clear 4.5:1 for text in every theme?
- Reasoning: `references/rules/sys-5.md`

## Make reversible deletion recoverable (`sys-6`)

Offer immediate Undo for a reversible removal and keep a discoverable recovery path when the notice expires. Confirm consequential actions that cannot be reliably reversed.

- Do: Moved to Trash with immediate Undo · Don't: Deleted → gone, no undo
- [ ] Can the item be restored after the notice vanishes?
- [ ] Do restored content and access match their prior state?
- [ ] Does the user know when deletion becomes permanent?
- Reasoning: `references/rules/sys-6.md`

## Orient people in a multi-step flow (`sys-7`)

For a long, predictable sequence, show the current stage and the work ahead. Use stage names without a fixed total when answers can change which steps appear.

- Do: Step 2 of 4 · Don't: No progress indicator
- [ ] Can the person identify the current task?
- [ ] Does the stated total remain accurate on each branch?
- [ ] Can they review an earlier answer without losing later work?
- Reasoning: `references/rules/sys-7.md`

## Follow the keyboard model for each control (`sys-8`)

Make each task operable by keyboard. Use native behavior where available. Tab moves between stops, arrow keys often move within groups, and Escape dismisses a modal dialog.

- Do: Tab → Enter → Esc flow works · Don't: Click-only interactions, no keyboard support
- [ ] Can the task be completed end to end without a pointer?
- [ ] Which keys does this control’s role lead users to expect?
- [ ] After dismissal, can the person continue from a sensible location?
- Reasoning: `references/rules/sys-8.md`

## Reconcile optimistic changes (`sys-9`)

For a low-risk, reversible action, show the intended state immediately when you can reconcile it with the service. Make a failed or superseded action understandable.

- Do: Heart fills instantly, syncs async · Don't: Spinner on every like button click
- [ ] Is the result safe to predict?
- [ ] Does a rapid second action survive a late response?
- [ ] Can the person tell what was actually saved after failure?
- Reasoning: `references/rules/sys-9.md`

## Recover at the point of failure (`sys-10`)

When part of a view fails, preserve the content that still works. Identify the unavailable information and offer a retry or another route when it can help.

- Do: Placeholder image + retry option · Don't: Broken image icon / blank screen
- [ ] What information does the missing resource carry?
- [ ] Can the rest of the task continue safely?
- [ ] Is another attempt likely to help, and is it safe to repeat?
- Reasoning: `references/rules/sys-10.md`

## Keep the task usable at 320 CSS pixels (`sys-11`)

Narrow the viewport to 320 CSS pixels, or zoom a 1280px window to 400%, and complete the page’s main task. Content should reflow without sideways scrolling. A wide table, map or code block may scroll inside its own region.

- Do: 320px: fields stack · Continue in view · Don't: 320px: min-width 512px · Continue off-screen
- [ ] At 320 CSS px, does `document.documentElement.scrollWidth` equal the viewport width?
- [ ] Zoom a 1280px window to 400% and complete the main task. Did any step need sideways scrolling?
- [ ] Which element sets the overflowing width, and does it need that width?
- Reasoning: `references/rules/sys-11.md`

## Limit transitions to intended properties (`sys-13`)

List the properties that should animate in a state change. A broad transition can also animate unrelated changes in computed style.

- Do: transition-property: scale, background-color · Don't: transition: all 150ms ease-out
- [ ] Which computed values are intended to interpolate?
- [ ] Does an unrelated explicit width change stretch the control?
- [ ] Does the rest of the interface settle as expected?
- Reasoning: `references/rules/sys-13.md`

## Return people to the result they opened (`sys-15`)

When someone opens an item from a searched, filtered or scrolled list, Back should bring them to the same query, filters, sort and scroll position, with the item they opened in view. A refresh or a pasted link should restore the same view.

- Do: Back → Overdue · sorted by due date · row 37 · Don't: Back → All invoices · top of the list
- [ ] Filter the list, sort it, scroll down, open row 37 and press Back. Is row 37 in view with the same filter and sort?
- [ ] Copy the URL while the list is filtered and paste it into a new tab. Does the same view load?
- [ ] Change the filter three times, open an item and press Back twice. Does the first Back return to the list and the second leave it?
- Reasoning: `references/rules/sys-15.md`

## Keep errors and the only recovery action on screen (`sys-16`)

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause any timer while the message is hovered, focused or in a hidden tab.

- Do: Upload failed · Retry stays until dismissed · Don't: Upload failed · Retry closes after 5s
- [ ] Trigger the failure, then wait ten seconds without touching anything. Are the error and Retry still on screen?
- [ ] Trigger it again, rest the pointer on the toast, then tab to it. Does it stay put while hovered or focused?
- [ ] Trigger it, switch to another tab for a minute and come back. Is the message still there?
- Reasoning: `references/rules/sys-16.md`
