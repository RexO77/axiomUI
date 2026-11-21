---
name: axiomui-system
description: Use Axiom UI’s system guidance when designing loading and empty states, multi-step progress, timeout and retry behavior, undo, optimistic updates, keeping an error and its only recovery action on screen, returning people to the result they opened, dates and times, semantic color tokens, hit areas for touch and pointer, keyboard behavior within controls, reflow at narrow widths, or which properties a transition animates.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: System & logic

Trace one action through success, delay and failure. If a saved state appears before the server replies, decide what the reader sees when the request fails or another change has already succeeded, and keep the failure and its Retry on screen until someone acts. Then open an item from a filtered list and press Back: the same filters and position should return.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test the failure the comparison illustrates. For a standard, verify the applicable requirement and its exceptions. For a design convention, judge the outcome with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Choose a loading state that explains the wait (`sys-1`)

Use a skeleton when the incoming layout is predictable. An indeterminate indicator fits an operation whose duration is unknown. Use measured progress when the amount of work completed is available.

- Do: Skeleton shaped like the incoming content
- Don't: Spinner replaces the whole content area
- Reasoning: `references/rules/sys-1.md` · https://axiomui.nischal.fyi/rules/sys-1

### Explain why a view is empty (`sys-2`)

Tell people what an empty view means. Offer a relevant next step when one exists, such as creating a first project or clearing a search filter.

- Do: “No projects yet” + “New project” button
- Don't: Empty panel, no next step
- Reasoning: `references/rules/sys-2.md` · https://axiomui.nischal.fyi/rules/sys-2

### Size the hit area for the input (`sys-3`)

Size the clickable area independently of the icon. A 44 × 44 CSS px target is a useful touch-friendly choice. WCAG 2.2 AA generally calls for 24 × 24 CSS px or a qualifying exception.

- Do: 44x44px hit area
- Don't: 16x16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Choose a timestamp for the question (`sys-4`)

Use relative time when recency matters and a localized date or time when someone needs a record. Make the exact timestamp available on touch and keyboard when the distinction matters.

- Do: Activity: 2m ago
- Don't: Activity: yyyy-mm-ddThh:mm:ssZ
- Reasoning: `references/rules/sys-4.md` · https://axiomui.nischal.fyi/rules/sys-4

### Reference colors by role, not by value (`sys-5`)

Have components ask for a role such as text, surface or warning, and resolve each role per theme. A literal value picked on the light theme stays put when the surface turns dark, and two features that share a hex by coincidence change together when one is restyled.

- Do: var(--text) → #f5f5f5 on #262626 (13.9:1)
- Don't: #0f172a on #262626 (1.2:1)
- Reasoning: `references/rules/sys-5.md` · https://axiomui.nischal.fyi/rules/sys-5

### Make reversible deletion recoverable (`sys-6`)

Offer immediate Undo for a reversible removal and keep a discoverable recovery path when the notice expires. Confirm consequential actions that cannot be reliably reversed.

- Do: Moved to Trash with immediate Undo
- Don't: Deleted → gone, no undo
- Reasoning: `references/rules/sys-6.md` · https://axiomui.nischal.fyi/rules/sys-6

### Orient people in a multi-step flow (`sys-7`)

For a long, predictable sequence, show the current stage and the work ahead. Use stage names without a fixed total when answers can change which steps appear.

- Do: Step 2 of 4
- Don't: No progress indicator
- Reasoning: `references/rules/sys-7.md` · https://axiomui.nischal.fyi/rules/sys-7

### Follow the keyboard model for each control (`sys-8`)

Make each task operable by keyboard. Use native behavior where available. Tab moves between stops, arrow keys often move within groups, and Escape dismisses a modal dialog.

- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

### Reconcile optimistic changes (`sys-9`)

For a low-risk, reversible action, show the intended state immediately when you can reconcile it with the service. Make a failed or superseded action understandable.

- Do: Heart fills instantly, syncs async
- Don't: Spinner on every like button click
- Reasoning: `references/rules/sys-9.md` · https://axiomui.nischal.fyi/rules/sys-9

### Recover at the point of failure (`sys-10`)

When part of a view fails, preserve the content that still works. Identify the unavailable information and offer a retry or another route when it can help.

- Do: Placeholder image + retry option
- Don't: Broken image icon / blank screen
- Reasoning: `references/rules/sys-10.md` · https://axiomui.nischal.fyi/rules/sys-10

### Keep the task usable at 320 CSS pixels (`sys-11`)

Narrow the viewport to 320 CSS pixels, or zoom a 1280px window to 400%, and complete the page’s main task. Content should reflow without sideways scrolling. A wide table, map or code block may scroll inside its own region.

- Do: 320px: fields stack · Continue in view
- Don't: 320px: min-width 512px · Continue off-screen
- Reasoning: `references/rules/sys-11.md` · https://axiomui.nischal.fyi/rules/sys-11

### Limit transitions to intended properties (`sys-13`)

List the properties that should animate in a state change. A broad transition can also animate unrelated changes in computed style.

- Do: transition-property: scale, background-color
- Don't: transition: all 150ms ease-out
- Reasoning: `references/rules/sys-13.md` · https://axiomui.nischal.fyi/rules/sys-13

### Return people to the result they opened (`sys-15`)

When someone opens an item from a searched, filtered or scrolled list, Back should bring them to the same query, filters, sort and scroll position, with the item they opened in view. A refresh or a pasted link should restore the same view.

- Do: Back → Overdue · sorted by due date · row 37
- Don't: Back → All invoices · top of the list
- Reasoning: `references/rules/sys-15.md` · https://axiomui.nischal.fyi/rules/sys-15

### Keep errors and the only recovery action on screen (`sys-16`)

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause any timer while the message is hovered, focused or in a hidden tab.

- Do: Upload failed · Retry stays until dismissed
- Don't: Upload failed · Retry closes after 5s
- Reasoning: `references/rules/sys-16.md` · https://axiomui.nischal.fyi/rules/sys-16

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
