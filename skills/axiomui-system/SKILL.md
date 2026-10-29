---
name: axiomui-system
description: Axiom UI's rules for system feedback and product logic, with Do/Don't values and reasoning. Use when designing loading skeletons, empty states, progress for multi-step flows, undo for destructive actions, optimistic updates, or graceful degradation when a request or an image fails, or when settling date formats, design token naming, or a breakpoint strategy.
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: System & logic

System rules govern what the interface does between the user's actions: while it loads, when there is nothing to show, when a request fails, and after a mistake. They also cover the plumbing that keeps behavior predictable across a product, such as token naming, breakpoints, date formats, target sizes and the scope of transitions. Design every state as part of the feature, not as cleanup after it.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Apply its Do as written. Values are targets, not suggestions.
3. Check the result against its Don't. Code that matches the Don't is a violation, whatever the intent behind it.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Skeleton loading (`sys-1`)

Spinners draw attention to the waiting. Skeletons (gray bars) imply progress and structure.

- Do: Gray layout pulse
- Don't: Giant spinning wheel
- Reasoning: `references/rules/sys-1.md` · https://axiomui.nischal.fyi/rules/sys-1

### Empty states (`sys-2`)

Never leave a blank screen. Say what is missing, why it is missing, and what to do next — an empty state is the one screen guaranteed to need instructions.

- Do: “No projects yet” + “New project” button
- Don't: Empty panel, no next step
- Reasoning: `references/rules/sys-2.md` · https://axiomui.nischal.fyi/rules/sys-2

### Click targets (Fitts's law) (`sys-3`)

Interactive elements need at least a 44x44px hit area. Acquisition time rises as a target shrinks (Fitts's law), and a fingertip covers roughly 8mm of glass however small the icon is.

- Do: 44x44px hit area
- Don't: 16x16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Date formats (`sys-4`)

Use relative dates (2 hours ago) where recency is the point, and absolute dates (12 Jan 2024) where the record is. A feed answers 'is this fresh?'; an audit log answers 'which day?'.

- Do: Activity: 2m ago
- Don't: Activity: yyyy-mm-ddThh:mm:ssZ
- Reasoning: `references/rules/sys-4.md` · https://axiomui.nischal.fyi/rules/sys-4

### Design tokens naming (`sys-5`)

Name colors for what they are (blue-500), not for what they do (primary). An alias layer maps the palette onto roles, so a rebrand edits one file instead of every component.

- Do: blue-500 (palette) → accent (alias) → component
- Don't: $button-blue → component
- Reasoning: `references/rules/sys-5.md` · https://axiomui.nischal.fyi/rules/sys-5

### Undo destructive actions (`sys-6`)

Prefer a few seconds of undo over a confirmation dialog. Undo costs nothing when the user meant it, and a dialog gets dismissed reflexively by everyone who did.

- Do: Deleted → Undo (5s)
- Don't: Deleted → gone, no undo
- Reasoning: `references/rules/sys-6.md` · https://axiomui.nischal.fyi/rules/sys-6

### Show progress for multi-step (`sys-7`)

If a flow runs three or more steps, show where the user is in it. An unbounded flow gives them no way to decide whether to start now or come back later.

- Do: Step 2 of 4
- Don't: No progress indicator
- Reasoning: `references/rules/sys-7.md` · https://axiomui.nischal.fyi/rules/sys-7

### Keyboard navigation (`sys-8`)

All interactive elements must be reachable via Tab, activatable via Enter/Space, and dismissible via Escape.

- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

### Optimistic UI updates (`sys-9`)

For low-risk actions (like/favorite/toggle), update the UI immediately and reconcile with the server in the background.

- Do: Heart fills instantly, syncs async
- Don't: Spinner on every like button click
- Reasoning: `references/rules/sys-9.md` · https://axiomui.nischal.fyi/rules/sys-9

### Graceful degradation (`sys-10`)

Always show a fallback when assets fail to load (broken images, failed API calls). Never show a broken state.

- Do: Placeholder image + retry option
- Don't: Broken image icon / blank screen
- Reasoning: `references/rules/sys-10.md` · https://axiomui.nischal.fyi/rules/sys-10

### Responsive breakpoint strategy (`sys-11`)

Two breakpoints, three tiers: mobile below 640px, tablet from 640px, desktop from 1024px. Break where the layout has to reflow, not where a device happens to exist.

- Do: 2 breakpoints: 640px / 1024px (3 tiers)
- Don't: 8 breakpoints, one per device
- Reasoning: `references/rules/sys-11.md` · https://axiomui.nischal.fyi/rules/sys-11

### Transition only what changes (`sys-13`)

Never use transition: all. Specify the exact properties that should animate so unrelated style changes do not move unexpectedly.

- Do: transition-property: scale, background-color
- Don't: transition: all 150ms ease-out
- Reasoning: `references/rules/sys-13.md` · https://axiomui.nischal.fyi/rules/sys-13

### Use will-change sparingly (`sys-14`)

will-change is a targeted performance hint, not a default. Use it only for compositor-friendly properties when a real first-frame stutter appears.

- Do: will-change: transform, opacity
- Don't: will-change: all
- Reasoning: `references/rules/sys-14.md` · https://axiomui.nischal.fyi/rules/sys-14

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
