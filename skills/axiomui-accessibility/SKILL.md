---
name: axiomui-accessibility
description: Use Axiom UI’s accessibility guidance to check keyboard focus, its visibility and its return when an overlay closes, target size and spacing, text and control contrast, meaning beyond color, underlined links in running text, heading levels, a click path for every drag, pausing content that moves on its own, field labels and input purpose, accessible authentication, chart alternatives, modal dismissal, reflow at 320 CSS px and reduced motion. Consult the sources on the linked rule page when checking a conformance claim.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Accessibility & inclusivity

Follow a task with the input method or presentation the rule addresses. Close a dialog with Escape and note where focus lands, reorder a list without dragging, paste a sign-in code from the clipboard, or zoom to 400% at 1280px wide and check that nothing scrolls sideways. For a WCAG finding, identify the applicable success criterion, its level and exceptions, and record what happened on the tested path.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test the failure the comparison illustrates. For a standard, verify the applicable requirement and its exceptions. For a design convention, judge the outcome with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Keep keyboard focus visible (`a11y-1`)

Keep a visible indicator on keyboard focus. A custom focus treatment should remain identifiable across the surfaces and display modes where the control appears.

- Do: focus-visible:outline-2 outline-offset-2
- Don't: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

### Carry meaning beyond color (`a11y-2`)

When color communicates an error, state or category, add a second cue someone can perceive without distinguishing the hues. For a detected form error, identify the field and describe the problem in text.

- Do: Red text + error icon + message
- Don't: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

### Separate competing touch targets (`a11y-3`)

Leave space between nearby actions when an unintended tap would be costly. An 8px gutter protects the particular miss shown here. WCAG sets size and spacing tests rather than one minimum gap for every button.

- Do: Buttons: 8px gutter
- Don't: Buttons: 0px gutter
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

### Offer a click or tap path for every drag (`a11y-4`)

Offer clicks or taps for tasks such as reordering a list, moving cards between columns or setting a slider. A drag can be required when the drawn path itself is essential to the task.

- Do: Drag handle + Move up / Move down
- Don't: Drag handle only
- Reasoning: `references/rules/a11y-4.md` · https://axiomui.nischal.fyi/rules/a11y-4

### Choose heading levels by outline, not size (`a11y-5`)

Choose heading levels from the page's section hierarchy. Style the headings independently so the visual sizes and the screen reader's heading list can both reflect the design.

- Do: h1 Settings → h2 Billing → h3 Invoices
- Don't: h1 Settings → h4 Billing → h4 Invoices
- Reasoning: `references/rules/a11y-5.md` · https://axiomui.nischal.fyi/rules/a11y-5

### Let people pause what moves or updates on its own (`a11y-6`)

For nonessential content presented alongside other content, offer a way to pause, stop or hide automatic movement, blinking or scrolling that lasts more than five seconds. For automatic updates, offer a control at any interval. Adjusting the update frequency also works.

- Do: Testimonial strip with Pause
- Don't: Quote changes every 4s · no control
- Reasoning: `references/rules/a11y-6.md` · https://axiomui.nischal.fyi/rules/a11y-6

### Underline links in running text (`a11y-7`)

Underline inline links so readers can spot them as they read. Navigation menus can use their layout and placement to identify links.

- Do: p a { text-decoration: underline }
- Don't: p a { text-decoration: none } · color only
- Reasoning: `references/rules/a11y-7.md` · https://axiomui.nischal.fyi/rules/a11y-7

### Return focus when an overlay closes (`a11y-8`)

When an overlay closes, return keyboard focus to the control that opened it. If closing removes that control, such as when a row is deleted, focus the next logical control in the workflow.

- Do: Esc → focus back on "Edit"
- Don't: Esc, then Tab → focus restarts at "New project"
- Reasoning: `references/rules/a11y-8.md` · https://axiomui.nischal.fyi/rules/a11y-8

## Cross-listed from other domains

These rules cover specific accessibility decisions in other domains. Check the conditions and exceptions in each rule before making a conformance finding.

### Keep scroll and focus targets clear of sticky headers (`layout-12`)

Account for the height of sticky headers and footers in the scroll container. After an anchor jump or keyboard focus, the entire target should be visible.

- From: Layout & spacing
- Do: scroll-padding-top: 64px
- Don't: scroll-padding-top: 0px
- Reasoning: `references/rules/layout-12.md` · https://axiomui.nischal.fyi/rules/layout-12

### Give essential control edges enough contrast (`color-6`)

When a boundary is needed to identify an enabled control, WCAG AA requires at least 3:1 contrast against its adjacent color. A decorative divider may be quieter. Check the actual pair in each theme.

- From: Color & depth
- Do: input border: neutral-500 · divider: neutral-200
- Don't: input border: neutral-100 · divider: neutral-200
- Reasoning: `references/rules/color-6.md` · https://axiomui.nischal.fyi/rules/color-6

### Accessible contrast ratios (`color-9`)

For WCAG AA, ordinary text needs at least 4.5:1 contrast. Large text qualifies at 3:1. Measure unrounded values against the actual background, including overlays and images behind the text.

- From: Color & depth
- Do: #737373 on #ffffff (4.7:1)
- Don't: #aaaaaa on #ffffff (2.3:1)
- Reasoning: `references/rules/color-9.md` · https://axiomui.nischal.fyi/rules/color-9

### Make overlay dismissal discoverable (`comp-12`)

Give dismissible dialogs a visible Close or Cancel action and support Escape. Choose outside-click behavior according to the cost of an accidental dismissal.

- From: Components & actions
- Do: X button + backdrop close + Esc key
- Don't: No close button, only backdrop click
- Reasoning: `references/rules/comp-12.md` · https://axiomui.nischal.fyi/rules/comp-12

### Make the chart’s question answerable in text (`comp-13`)

Identify what the chart shows and describe the comparison readers need. When the task calls for individual values, offer them in a labeled table or another accessible representation that follows the selected period.

- From: Components & actions
- Do: Summarize the trend and offer the monthly counts
- Don't: Leave the trend and counts in the bars alone
- Reasoning: `references/rules/comp-13.md` · https://axiomui.nischal.fyi/rules/comp-13

### Navigate with links, act with buttons (`comp-14`)

If activating a control takes someone to another URL, make it a link with an href, however it is styled. The browser then offers Open in new tab and Copy link, and shows the address before the click. Keep buttons for actions that change something on the current page.

- From: Components & actions
- Do: <a href="/invoices/1042">View invoice</a>
- Don't: <div onClick={() => router.push(…)}>
- Reasoning: `references/rules/comp-14.md` · https://axiomui.nischal.fyi/rules/comp-14

### Keep field labels visible (`form-2`)

Keep a visible label after typing or autofill. A placeholder can illustrate an entry, but it disappears precisely when someone needs to review the completed form.

- From: Forms & inputs
- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address
- Reasoning: `references/rules/form-2.md` · https://axiomui.nischal.fyi/rules/form-2

### Accept a complete sign-in code in one paste (`form-13`)

Let people paste a one-time code as they receive it. Keep leading zeros and support autofill where available. A design with separate boxes can still accept the entire code in one operation.

- From: Forms & inputs
- Do: One paste fills all six digits, including the leading zero
- Don't: One paste fills only the first box
- Reasoning: `references/rules/form-13.md` · https://axiomui.nischal.fyi/rules/form-13

### Declare what each field expects (`form-14`)

Declare the input type, keyboard layout, and autocomplete purpose so the browser can offer the right keys and saved answers. Turn off spellcheck and automatic capitalization for identifiers such as emails, usernames, and codes.

- From: Forms & inputs
- Do: Email keyboard · saved address suggested
- Don't: Plain keyboard · capitalizes Maya@
- Reasoning: `references/rules/form-14.md` · https://axiomui.nischal.fyi/rules/form-14

### Size the hit area for the input (`sys-3`)

Size the clickable area independently of the icon. A 44 × 44 CSS px target is a useful touch-friendly choice. WCAG 2.2 AA generally calls for 24 × 24 CSS px or a qualifying exception.

- From: System & logic
- Do: 44x44px hit area
- Don't: 16x16px hit area
- Reasoning: `references/rules/sys-3.md` · https://axiomui.nischal.fyi/rules/sys-3

### Follow the keyboard model for each control (`sys-8`)

Make each task operable by keyboard. Use native behavior where available. Tab moves between stops, arrow keys often move within groups, and Escape dismisses a modal dialog.

- From: System & logic
- Do: Tab → Enter → Esc flow works
- Don't: Click-only interactions, no keyboard support
- Reasoning: `references/rules/sys-8.md` · https://axiomui.nischal.fyi/rules/sys-8

### Keep the task usable at 320 CSS pixels (`sys-11`)

Narrow the viewport to 320 CSS pixels, or zoom a 1280px window to 400%, and complete the page’s main task. Content should reflow without sideways scrolling. A wide table, map or code block may scroll inside its own region.

- From: System & logic
- Do: 320px: fields stack · Continue in view
- Don't: 320px: min-width 512px · Continue off-screen
- Reasoning: `references/rules/sys-11.md` · https://axiomui.nischal.fyi/rules/sys-11

### Keep errors and the only recovery action on screen (`sys-16`)

A success message whose result is visible elsewhere can time out. A failure, or a message that holds the only Undo or Retry, stays until the person acts on it or closes it. Pause any timer while the message is hovered, focused or in a hidden tab.

- From: System & logic
- Do: Upload failed · Retry stays until dismissed
- Don't: Upload failed · Retry closes after 5s
- Reasoning: `references/rules/sys-16.md` · https://axiomui.nischal.fyi/rules/sys-16

### Keep keyboard input responsive (`motion-2`)

When a shortcut opens a command palette, move focus into the field and accept the next keystroke while the panel settles.

- From: Motion & interaction
- Do: Focus on open. First keystrokes land.
- Don't: Focus after entrance. First keystrokes are lost.
- Reasoning: `references/rules/motion-2.md` · https://axiomui.nischal.fyi/rules/motion-2

### Preserve feedback with reduced motion (`motion-17`)

Honor reduced motion by removing unnecessary travel, zoom and spin. Show the resulting state through a stable label, icon or other persistent cue.

- From: Motion & interaction
- Do: Reduced motion: fade in place
- Don't: Reduced motion: slides anyway
- Reasoning: `references/rules/motion-17.md` · https://axiomui.nischal.fyi/rules/motion-17

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
