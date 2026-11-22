---
name: axiomui-system
description: Use Axiom UI’s system guidance when designing loading and empty states, multi-step progress, recovering when part of a view fails, retry behavior, undo, optimistic updates, keeping an error and its only recovery action on screen, returning people to the result they opened, dates and times, semantic color tokens, hit areas for touch and pointer, keyboard behavior within controls, reflow at narrow widths, or which properties a transition animates.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: System & logic

Trace one action through success, delay and failure. If the interface shows a change as saved before the server replies, test a failed request. Keep later successful changes intact and leave the error and its Retry action visible until the user acts or dismisses it. Then open an item from a filtered list and press Back: the same filters and position should return.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test for the failure the Don’t example shows. For a standard, check the applicable requirement and its exceptions. For a design convention, test with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule ID and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Choose a loading state that explains the wait (`sys-1`)

Use a skeleton when you know the layout. Show a progress bar when you can measure the work completed. Use a spinner when all you can say is that work is underway.

- Do: Skeleton shaped like the incoming content
- Don’t: Spinner replaces the whole content area
- Reasoning: `references/rules/sys-1.md` · https://axiomui.nischal.fyi/rules/sys-1

### Explain why a view is empty (`sys-2`)

Say why the view is empty. If someone can create a first project or clear a search filter, offer that action.

- Do: “No projects yet” + “New project” button
- Don’t: Blank panel · no message or action
- Reasoning: `references/rules/sys-2.md` · https://axiomui.nischal.fyi/rules/sys-2

### Give small icons a larger hit area (`sys-3`)

Size the hit area separately from the icon. Aim for 44 × 44 CSS pixels on touch. WCAG 2.2 AA requires at least 24 × 24 CSS pixels unless an exception applies.

- Do: 44 × 44px hit area
- Don’t: 16 × 16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Use relative time for activity, dates for records (`sys-4`)

Use relative time to show how recent an event is. For a record, show the date or time in the reader's locale. If a relative label needs an exact time, make it available by touch and keyboard.

- Do: Activity: 2m ago
- Don’t: Activity: 2026-08-10T14:02:11Z
- Reasoning: `references/rules/sys-4.md` · https://axiomui.nischal.fyi/rules/sys-4

### Reference colors by role, not by value (`sys-5`)

Give text, surfaces and warnings separate color roles. Set their values per theme so text stays readable and a button can change color independently of a warning.

- Do: var(--text) → #f5f5f5 on #262626 (13.9:1)
- Don’t: #0f172a on #262626 (1.2:1)
- Reasoning: `references/rules/sys-5.md` · https://axiomui.nischal.fyi/rules/sys-5

### Let people restore deleted items (`sys-6`)

Offer Undo when an item moves to Trash. Keep it recoverable from Trash after the message closes. Ask for confirmation before a consequential deletion that cannot reliably be undone.

- Do: Moved to Trash with immediate Undo
- Don’t: Permanently deleted · no Undo
- Reasoning: `references/rules/sys-6.md` · https://axiomui.nischal.fyi/rules/sys-6

### Show the current step in a multi-step flow (`sys-7`)

For a fixed sequence, show the current step and how many remain. If answers can add or skip steps, show the step names without a fixed total.

- Do: Step 2 of 4
- Don’t: No progress indicator
- Reasoning: `references/rules/sys-7.md` · https://axiomui.nischal.fyi/rules/sys-7

### Use the keys people expect for each control (`sys-8`)

Make every task usable by keyboard. Use native controls where possible. Tab moves between controls, arrow keys move within groups such as tabs and radio buttons, and Escape closes a modal dialog.

- Do: Tab moves focus · Enter activates · Esc dismisses
- Don’t: Tab skips Archive · Esc does nothing
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

### Show changes before the server confirms them (`sys-9`)

For a low-risk action like liking a post, show the change immediately. If saving fails, say so and show the last confirmed state. If someone taps again, keep their latest choice when earlier replies arrive.

- Do: Heart starts filling at 0ms · Synced starts appearing at 700ms
- Don’t: Spinner until the heart starts filling at 560ms
- Reasoning: `references/rules/sys-9.md` · https://axiomui.nischal.fyi/rules/sys-9

### Contain a failure to the part that failed (`sys-10`)

Keep the content that loaded. Say which part failed and offer Retry there, or another way to continue.

- Do: Image keeps its space · Reload image
- Don’t: Broken image icon and hero@2x.jpg · article title shifts up
- Reasoning: `references/rules/sys-10.md` · https://axiomui.nischal.fyi/rules/sys-10

### Keep the task usable at 320 CSS pixels (`sys-11`)

Set the viewport to 320 CSS pixels, or start at 1280px and zoom to 400%. Complete the main task without scrolling the page sideways. Let a table, map or code block scroll separately if its layout is essential.

- Do: 320px: fields stack · Continue in view
- Don’t: 320px: min-width 512px · Continue off-screen
- Reasoning: `references/rules/sys-11.md` · https://axiomui.nischal.fyi/rules/sys-11

### Limit transitions to intended properties (`sys-13`)

List the CSS properties you want to animate. With transition: all, setting a new button width can animate that change too.

- Do: transition-property: scale, background-color
- Don’t: transition: all 150ms ease-out
- Reasoning: `references/rules/sys-13.md` · https://axiomui.nischal.fyi/rules/sys-13

### Return people to the result they opened (`sys-15`)

Back should return to the same scroll position with the item in view. Keep the search, filters, sort and page in the URL so a refresh or shared link restores the same results.

- Do: Back → Overdue · sorted by due date · row 37
- Don’t: Back → All invoices · top of the list
- Reasoning: `references/rules/sys-15.md` · https://axiomui.nischal.fyi/rules/sys-15

### Keep errors and the only recovery action on screen (`sys-16`)

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause the timer while the pointer is over the message, focus is inside it, or the tab is hidden.

- Do: Upload failed · stays until Retry or dismissal
- Don’t: Upload failed · message closes at 5s · Retry disappears
- Reasoning: `references/rules/sys-16.md` · https://axiomui.nischal.fyi/rules/sys-16

## Related

If installed, `axiomui` covers every domain and `axiomui-audit` provides a read-only review. You can use this domain skill on its own.
