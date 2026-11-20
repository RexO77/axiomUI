# System & logic

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Choose a loading state that explains the wait (`sys-1`)

Use a skeleton when the incoming layout is predictable. An indeterminate indicator fits an operation whose duration is unknown. Use measured progress when the amount of work completed is available.

- Do: Skeleton shaped like the incoming content
- Don't: Spinner replaces the whole content area
- Reasoning: `references/rules/sys-1.md` · https://axiomui.nischal.fyi/rules/sys-1

## Explain why a view is empty (`sys-2`)

Tell people what an empty view means. Offer a relevant next step when one exists, such as creating a first project or clearing a search filter.

- Do: “No projects yet” + “New project” button
- Don't: Empty panel, no next step
- Reasoning: `references/rules/sys-2.md` · https://axiomui.nischal.fyi/rules/sys-2

## Size the hit area for the input (`sys-3`)

Size the clickable area independently of the icon. A 44 × 44 CSS px target is a useful touch-friendly choice. WCAG 2.2 AA generally calls for 24 × 24 CSS px or a qualifying exception.

- Do: 44x44px hit area
- Don't: 16x16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

## Choose a timestamp for the question (`sys-4`)

Use relative time when recency matters and a localized date or time when someone needs a record. Make the exact timestamp available on touch and keyboard when the distinction matters.

- Do: Activity: 2m ago
- Don't: Activity: yyyy-mm-ddThh:mm:ssZ
- Reasoning: `references/rules/sys-4.md` · https://axiomui.nischal.fyi/rules/sys-4

## Give shared colors semantic roles (`sys-5`)

Let components request a role such as accent or warning. Map that role to a palette value for each theme when several components share the same intent.

- Do: blue-500 (palette) → accent (alias) → component
- Don't: $button-blue → component
- Reasoning: `references/rules/sys-5.md` · https://axiomui.nischal.fyi/rules/sys-5

## Make reversible deletion recoverable (`sys-6`)

Offer immediate Undo for a reversible removal and keep a discoverable recovery path when the notice expires. Confirm consequential actions that cannot be reliably reversed.

- Do: Moved to Trash with immediate Undo
- Don't: Deleted → gone, no undo
- Reasoning: `references/rules/sys-6.md` · https://axiomui.nischal.fyi/rules/sys-6

## Orient people in a multi-step flow (`sys-7`)

For a long, predictable sequence, show the current stage and the work ahead. Use stage names without a fixed total when answers can change which steps appear.

- Do: Step 2 of 4
- Don't: No progress indicator
- Reasoning: `references/rules/sys-7.md` · https://axiomui.nischal.fyi/rules/sys-7

## Follow the keyboard model for each control (`sys-8`)

Make each task operable by keyboard. Use native behavior where available. Tab moves between stops, arrow keys often move within groups, and Escape dismisses a modal dialog.

- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

## Reconcile optimistic changes (`sys-9`)

For a low-risk, reversible action, show the intended state immediately when you can reconcile it with the service. Make a failed or superseded action understandable.

- Do: Heart fills instantly, syncs async
- Don't: Spinner on every like button click
- Reasoning: `references/rules/sys-9.md` · https://axiomui.nischal.fyi/rules/sys-9

## Recover at the point of failure (`sys-10`)

When part of a view fails, preserve the content that still works. Identify the unavailable information and offer a retry or another route when it can help.

- Do: Placeholder image + retry option
- Don't: Broken image icon / blank screen
- Reasoning: `references/rules/sys-10.md` · https://axiomui.nischal.fyi/rules/sys-10

## Set breakpoints where the layout needs them (`sys-11`)

Resize the content until it no longer works, then choose a reflow that solves the failure. The example uses 640px and 1024px. A different interface may need different thresholds or none.

- Do: 2 breakpoints: 640px / 1024px (3 tiers)
- Don't: 8 breakpoints, one per device
- Reasoning: `references/rules/sys-11.md` · https://axiomui.nischal.fyi/rules/sys-11

## Limit transitions to intended properties (`sys-13`)

List the properties that should animate in a state change. A broad transition can also animate unrelated changes in computed style.

- Do: transition-property: scale, background-color
- Don't: transition: all 150ms ease-out
- Reasoning: `references/rules/sys-13.md` · https://axiomui.nischal.fyi/rules/sys-13

## Use will-change sparingly (`sys-14`)

Use will-change only when profiling shows that advance preparation helps a particular element. Name the expected property and release the hint when the need passes.

- Do: will-change: transform, opacity on one measured card
- Don't: will-change: transform, opacity on every card
- Reasoning: `references/rules/sys-14.md` · https://axiomui.nischal.fyi/rules/sys-14
