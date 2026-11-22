---
name: axiomui-accessibility
description: Use Axiom UI’s accessibility guidance to check keyboard focus, its visibility and its return when an overlay closes, target size and spacing, text and control contrast, meaning beyond color, underlined links in running text, heading levels, a click path for every drag, pausing content that moves on its own, field labels and input purpose, accessible authentication, chart alternatives, modal dismissal, reflow at 320 CSS pixels and reduced motion. Consult the sources on the linked rule page when checking a conformance claim.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Accessibility & inclusivity

Follow a task with the input method or presentation the rule addresses. Close a dialog with Escape and note where focus lands, reorder a list without dragging, paste a sign-in code from the clipboard, or zoom a viewport 1280 CSS pixels wide to 400% and complete the task without scrolling the page sideways. A wide table or map may scroll within its own region. For a WCAG finding, identify the applicable success criterion, its level and exceptions, and record what happened on the tested path.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test for the failure the Don’t example shows. For a standard, check the applicable requirement and its exceptions. For a design convention, test with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule ID and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Keep keyboard focus visible (`a11y-1`)

Show which control has keyboard focus. Check that a custom focus indicator stays visible on every background and in high-contrast modes.

- Do: focus-visible:outline-2 outline-offset-2
- Don’t: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

### Pair color with another cue (`a11y-2`)

If color marks an error, state or category, add a label, icon or pattern with the same meaning. For a form error, name the field and explain the problem in text.

- Do: Red border + error icon + message
- Don’t: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

### Leave space between touch targets (`a11y-3`)

Leave room between actions such as Cancel and Delete. Here, an 8px gap catches a tap 3px past Cancel. WCAG tests target size and spacing together.

- Do: 8px gap between buttons
- Don’t: 0px gap between buttons
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

### Offer a click or tap alternative to dragging (`a11y-4`)

Let people click or tap to reorder a list, move a card between columns or set a slider value. Several taps can replace one drag.

- Do: Drag handle + Move up / Move down
- Don’t: Drag handle only
- Reasoning: `references/rules/a11y-4.md` · https://axiomui.nischal.fyi/rules/a11y-4

### Choose heading levels by outline, not size (`a11y-5`)

Choose heading levels to show how sections nest. Set the type size in CSS.

- Do: h1 Settings → h2 Billing → h3 Invoices
- Don’t: h1 Settings → h4 Billing → h4 Invoices
- Reasoning: `references/rules/a11y-5.md` · https://axiomui.nischal.fyi/rules/a11y-5

### Let people pause what moves or updates on its own (`a11y-6`)

If content moves, blinks or scrolls automatically for over 5 seconds beside other content, let readers pause, stop or hide it unless the movement is essential. A rotating quote needs a control at any interval. Let readers pause it or choose how often it changes.

- Do: Rotating quote with a Pause button
- Don’t: Quote changes every 4s · no control
- Reasoning: `references/rules/a11y-6.md` · https://axiomui.nischal.fyi/rules/a11y-6

### Underline links in paragraphs (`a11y-7`)

Underline links in paragraphs so readers can find them without distinguishing colors. In a navigation menu, placement can identify the links.

- Do: p a { text-decoration: underline }
- Don’t: p a { text-decoration: none } · color only
- Reasoning: `references/rules/a11y-7.md` · https://axiomui.nischal.fyi/rules/a11y-7

### Return focus when a dialog closes (`a11y-8`)

When a dialog closes, return keyboard focus to the control that opened it. If that control disappears or the task continues elsewhere, focus the next step.

- Do: Esc → focus returns to “Edit”
- Don’t: Esc, then Tab → focus moves to “New project”
- Reasoning: `references/rules/a11y-8.md` · https://axiomui.nischal.fyi/rules/a11y-8

## Cross-listed from other domains

These rules cover accessibility decisions filed under other domains. Check each rule’s conditions and exceptions before reporting a conformance failure.

### Keep scroll and focus targets clear of sticky headers (`layout-12`)

Set scroll padding to clear sticky headers and footers. Follow an in-page link or press Tab and check that the whole target is visible.

- From: Layout & spacing
- Do: scroll-padding-top: 64px
- Don’t: scroll-padding-top: 0px
- Reasoning: `references/rules/layout-12.md` · https://axiomui.nischal.fyi/rules/layout-12

### Give essential control edges at least 3:1 contrast (`color-6`)

If a border is how people recognize an enabled control, WCAG AA requires at least 3:1 contrast against the color beside it. Decorative dividers can be fainter. Check both themes.

- From: Color & depth
- Do: Light mode · input border neutral-500 · divider neutral-200. Dark mode · input border neutral-400 · divider neutral-800
- Don’t: Light mode · input border neutral-100 · divider neutral-200. Dark mode · input border neutral-900 · divider neutral-800
- Reasoning: `references/rules/color-6.md` · https://axiomui.nischal.fyi/rules/color-6

### Check text contrast (`color-9`)

WCAG AA requires at least 4.5:1 contrast for ordinary text and 3:1 for large text. Measure against the background behind the letters, including images and overlays. Use the unrounded ratio.

- From: Color & depth
- Do: #737373 on #ffffff (4.7:1)
- Don’t: #aaaaaa on #ffffff (2.3:1)
- Reasoning: `references/rules/color-9.md` · https://axiomui.nischal.fyi/rules/color-9

### Show how to close a dialog (`comp-12`)

Give dismissible dialogs a visible Close or Cancel button and support Escape. Allow a click outside to close the dialog when closing it loses no work.

- From: Components & actions
- Do: Close button, Escape or click outside
- Don’t: No close button, only backdrop click
- Reasoning: `references/rules/comp-12.md` · https://axiomui.nischal.fyi/rules/comp-12

### State the chart’s main finding in words (`comp-13`)

Name what the chart measures and summarize the main comparison. When exact values matter, make them available in a labeled table or another accessible format. Update both with the selected period.

- From: Components & actions
- Do: Trend in words, monthly counts in the interactive example
- Don’t: Bars without a written summary or counts table
- Reasoning: `references/rules/comp-13.md` · https://axiomui.nischal.fyi/rules/comp-13

### Navigate with links, act with buttons (`comp-14`)

Use a link with an href to open a destination. People can then copy its address or open it in another tab. Use a button to perform an action, even if it redirects afterward.

- From: Components & actions
- Do: `<a href="/invoices/1042">View invoice</a>`
- Don’t: `<div onClick={() => router.push(…)}>`
- Reasoning: `references/rules/comp-14.md` · https://axiomui.nischal.fyi/rules/comp-14

### Keep field labels visible (`form-2`)

Give each field a label that stays visible after typing or autofill. Use the placeholder for an example that can disappear.

- From: Forms & inputs
- Do: Label: Work email / Placeholder: you@company.com
- Don’t: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

### Accept a one-time code in one paste (`form-13`)

Accept the whole one-time code in one paste, even across separate boxes. Keep leading zeros and support autofill where available.

- From: Forms & inputs
- Do: One paste fills all six digits, including the leading zero
- Don’t: One paste fills only the first box
- Reasoning: `references/rules/form-13.md` · https://axiomui.nischal.fyi/rules/form-13

### Declare what each field expects (`form-14`)

Set type, inputmode and autocomplete so browsers can offer the right keyboard and saved answers. Turn off spellcheck and automatic capitalization for email addresses, usernames and codes.

- From: Forms & inputs
- Do: Email keyboard · saved email address suggested
- Don’t: Plain keyboard · capitalizes Maya@
- Reasoning: `references/rules/form-14.md` · https://axiomui.nischal.fyi/rules/form-14

### Give small icons a larger hit area (`sys-3`)

Size the hit area separately from the icon. Aim for 44 × 44 CSS pixels on touch. WCAG 2.2 AA requires at least 24 × 24 CSS pixels unless an exception applies.

- From: System & logic
- Do: 44 × 44px hit area
- Don’t: 16 × 16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Use the keys people expect for each control (`sys-8`)

Make every task usable by keyboard. Use native controls where possible. Tab moves between controls, arrow keys move within groups such as tabs and radio buttons, and Escape closes a modal dialog.

- From: System & logic
- Do: Tab moves focus · Enter activates · Esc dismisses
- Don’t: Tab skips Archive · Esc does nothing
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

### Keep the task usable at 320 CSS pixels (`sys-11`)

Set the viewport to 320 CSS pixels, or start at 1280px and zoom to 400%. Complete the main task without scrolling the page sideways. Let a table, map or code block scroll separately if its layout is essential.

- From: System & logic
- Do: 320px: fields stack · Continue in view
- Don’t: 320px: min-width 512px · Continue off-screen
- Reasoning: `references/rules/sys-11.md` · https://axiomui.nischal.fyi/rules/sys-11

### Keep errors and the only recovery action on screen (`sys-16`)

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause the timer while the pointer is over the message, focus is inside it, or the tab is hidden.

- From: System & logic
- Do: Upload failed · stays until Retry or dismissal
- Don’t: Upload failed · message closes at 5s · Retry disappears
- Reasoning: `references/rules/sys-16.md` · https://axiomui.nischal.fyi/rules/sys-16

### Focus the palette field on open (`motion-2`)

When a shortcut opens a command palette, focus its field immediately so people can type while it opens.

- From: Motion & interaction
- Do: Focus on open. First keystrokes land.
- Don’t: Focus after entrance. First keystrokes are lost.
- Reasoning: `references/rules/motion-2.md` · https://axiomui.nischal.fyi/rules/motion-2

### Preserve feedback with reduced motion (`motion-17`)

When reduced motion is on, remove unnecessary travel, zoom and spin. Keep the result visible with a label or icon.

- From: Motion & interaction
- Do: With motion on, the toast fades in place
- Don’t: With motion on, the toast slides up
- Reasoning: `references/rules/motion-17.md` · https://axiomui.nischal.fyi/rules/motion-17

## Related

If installed, `axiomui` covers every domain and `axiomui-audit` provides a read-only review. You can use this domain skill on its own.
