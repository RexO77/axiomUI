# Accessibility & inclusivity checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Keep keyboard focus visible (`a11y-1`)

Show which control has keyboard focus. Check that a custom focus indicator stays visible on every background and in high-contrast modes.

- Do: focus-visible:outline-2 outline-offset-2 · Don’t: outline: none with no replacement
- [ ] As you tab through the page, can you always see which control has focus?
- [ ] Is the indicator distinguishable wherever it is drawn?
- [ ] Does it remain visible under zoom, clipping and forced colors?
- Reasoning: `references/rules/a11y-1.md`

## Pair color with another cue (`a11y-2`)

If color marks an error, state or category, add a label, icon or pattern with the same meaning. For a form error, name the field and explain the problem in text.

- Do: Red border + error icon + message · Don’t: Only a red border on the input
- [ ] Can you tell the two states apart in grayscale?
- [ ] Does the message explain what needs correcting?
- [ ] When you focus the field with a screen reader, do you hear the error message?
- Reasoning: `references/rules/a11y-2.md`

## Leave space between touch targets (`a11y-3`)

Leave room between actions such as Cancel and Delete. Here, an 8px gap catches a tap 3px past Cancel. WCAG tests target size and spacing together.

- Do: 8px gap between buttons · Don’t: 0px gap between buttons
- [ ] Where does a near miss land?
- [ ] Do expanded hit areas overlap?
- [ ] Could a tap just past Cancel trigger Delete?
- Reasoning: `references/rules/a11y-3.md`

## Offer a click or tap alternative to dragging (`a11y-4`)

Let people click or tap to reorder a list, move a card between columns or set a slider value. Several taps can replace one drag.

- Do: Drag handle + Move up / Move down · Don’t: Drag handle only
- [ ] In your reorderable list, tap Move up once on the item in position 2. Does it move to position 1?
- [ ] Can taps reach every destination or value the drag can reach?
- [ ] Do both input paths produce the same saved order or value?
- Reasoning: `references/rules/a11y-4.md`

## Choose heading levels by outline, not size (`a11y-5`)

Choose heading levels to show how sections nest. Set the type size in CSS.

- Do: h1 Settings → h2 Billing → h3 Invoices · Don’t: h1 Settings → h4 Billing → h4 Invoices
- [ ] Open your page’s heading list in a screen reader. Do the levels show how sections nest, as Settings (1), Billing (2) and Invoices (3) do here?
- [ ] If the designer shrinks Billing, does it stay a level 2 heading?
- [ ] Do sections at the same depth use the same heading level?
- Reasoning: `references/rules/a11y-5.md`

## Let people pause what moves or updates on its own (`a11y-6`)

If content moves, blinks or scrolls automatically for over 5 seconds beside other content, let readers pause, stop or hide it unless the movement is essential. A rotating quote needs a control at any interval. Let readers pause it or choose how often it changes.

- Do: Rotating quote with a Pause button · Don’t: Quote changes every 4s · no control
- [ ] In your own rotating strip, tab to Pause and press Space. With a 4-second interval, does the same quote stay visible for two intervals?
- [ ] Does the strip stay paused when focus leaves the control?
- [ ] Can someone tell that the strip is paused before resuming it?
- Reasoning: `references/rules/a11y-6.md`

## Underline links in paragraphs (`a11y-7`)

Underline links in paragraphs so readers can find them without distinguishing colors. In a navigation menu, placement can identify the links.

- Do: p a { text-decoration: underline } · Don’t: p a { text-decoration: none } · color only
- [ ] Turn on grayscale, move the pointer off the paragraph and read the sentence. Can you find the sharing guide link before interacting with it?
- [ ] Does a visited inline link retain an underline or a sufficient visual cue at rest?
- [ ] If color alone marks a link, does it reach 3:1 contrast with surrounding text before anyone interacts with it?
- Reasoning: `references/rules/a11y-7.md`

## Return focus when a dialog closes (`a11y-8`)

When a dialog closes, return keyboard focus to the control that opened it. If that control disappears or the task continues elsewhere, focus the next step.

- Do: Esc → focus returns to “Edit” · Don’t: Esc, then Tab → focus moves to “New project”
- [ ] In your project list, open an edit dialog with the keyboard and press Escape. Is focus back on the row’s Edit button before you press Tab again?
- [ ] Do Cancel and Save also put focus where the task should continue?
- [ ] If your dialog can delete a row, try deleting the last one. Can you continue from the previous row or, in an empty list, from New project?
- Reasoning: `references/rules/a11y-8.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `layout-12` Keep scroll and focus targets clear of sticky headers (`references/checklists/layout.md`)
- `color-6` Give essential control edges at least 3:1 contrast (`references/checklists/color.md`)
- `color-9` Check text contrast (`references/checklists/color.md`)
- `comp-12` Show how to close a dialog (`references/checklists/components.md`)
- `comp-13` State the chart’s main finding in words (`references/checklists/components.md`)
- `comp-14` Navigate with links, act with buttons (`references/checklists/components.md`)
- `form-2` Keep field labels visible (`references/checklists/forms.md`)
- `form-13` Accept a one-time code in one paste (`references/checklists/forms.md`)
- `form-14` Declare what each field expects (`references/checklists/forms.md`)
- `sys-3` Give small icons a larger hit area (`references/checklists/system.md`)
- `sys-8` Use the keys people expect for each control (`references/checklists/system.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/checklists/system.md`)
- `sys-16` Keep errors and the only recovery action on screen (`references/checklists/system.md`)
- `motion-2` Focus the palette field on open (`references/checklists/motion.md`)
- `motion-17` Preserve feedback with reduced motion (`references/checklists/motion.md`)
