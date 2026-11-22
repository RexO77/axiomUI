# Accessibility & inclusivity

Compact Do/Don’t for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Keep keyboard focus visible (`a11y-1`)

Show which control has keyboard focus. Check that a custom focus indicator stays visible on every background and in high-contrast modes.

- Do: focus-visible:outline-2 outline-offset-2
- Don’t: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

## Pair color with another cue (`a11y-2`)

If color marks an error, state or category, add a label, icon or pattern with the same meaning. For a form error, name the field and explain the problem in text.

- Do: Red border + error icon + message
- Don’t: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

## Leave space between touch targets (`a11y-3`)

Leave room between actions such as Cancel and Delete. Here, an 8px gap catches a tap 3px past Cancel. WCAG tests target size and spacing together.

- Do: 8px gap between buttons
- Don’t: 0px gap between buttons
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

## Offer a click or tap alternative to dragging (`a11y-4`)

Let people click or tap to reorder a list, move a card between columns or set a slider value. Several taps can replace one drag.

- Do: Drag handle + Move up / Move down
- Don’t: Drag handle only
- Reasoning: `references/rules/a11y-4.md` · https://axiomui.nischal.fyi/rules/a11y-4

## Choose heading levels by outline, not size (`a11y-5`)

Choose heading levels to show how sections nest. Set the type size in CSS.

- Do: h1 Settings → h2 Billing → h3 Invoices
- Don’t: h1 Settings → h4 Billing → h4 Invoices
- Reasoning: `references/rules/a11y-5.md` · https://axiomui.nischal.fyi/rules/a11y-5

## Let people pause what moves or updates on its own (`a11y-6`)

If content moves, blinks or scrolls automatically for over 5 seconds beside other content, let readers pause, stop or hide it unless the movement is essential. A rotating quote needs a control at any interval. Let readers pause it or choose how often it changes.

- Do: Rotating quote with a Pause button
- Don’t: Quote changes every 4s · no control
- Reasoning: `references/rules/a11y-6.md` · https://axiomui.nischal.fyi/rules/a11y-6

## Underline links in paragraphs (`a11y-7`)

Underline links in paragraphs so readers can find them without distinguishing colors. In a navigation menu, placement can identify the links.

- Do: p a { text-decoration: underline }
- Don’t: p a { text-decoration: none } · color only
- Reasoning: `references/rules/a11y-7.md` · https://axiomui.nischal.fyi/rules/a11y-7

## Return focus when a dialog closes (`a11y-8`)

When a dialog closes, return keyboard focus to the control that opened it. If that control disappears or the task continues elsewhere, focus the next step.

- Do: Esc → focus returns to “Edit”
- Don’t: Esc, then Tab → focus moves to “New project”
- Reasoning: `references/rules/a11y-8.md` · https://axiomui.nischal.fyi/rules/a11y-8

## Related rules in other domains

- `layout-12` Keep scroll and focus targets clear of sticky headers (`references/layout.md`)
- `color-6` Give essential control edges at least 3:1 contrast (`references/color.md`)
- `color-9` Check text contrast (`references/color.md`)
- `comp-12` Show how to close a dialog (`references/components.md`)
- `comp-13` State the chart’s main finding in words (`references/components.md`)
- `comp-14` Navigate with links, act with buttons (`references/components.md`)
- `form-2` Keep field labels visible (`references/forms.md`)
- `form-13` Accept a one-time code in one paste (`references/forms.md`)
- `form-14` Declare what each field expects (`references/forms.md`)
- `sys-3` Give small icons a larger hit area (`references/system.md`)
- `sys-8` Use the keys people expect for each control (`references/system.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/system.md`)
- `sys-16` Keep errors and the only recovery action on screen (`references/system.md`)
- `motion-2` Focus the palette field on open (`references/motion.md`)
- `motion-17` Preserve feedback with reduced motion (`references/motion.md`)
