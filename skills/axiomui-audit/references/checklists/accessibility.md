# Accessibility & inclusivity checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Keep keyboard focus visible (`a11y-1`)

Keep a visible indicator on keyboard focus. A custom focus treatment should remain identifiable across the surfaces and display modes where the control appears.

- Do: focus-visible:outline-2 outline-offset-2 · Don't: outline: none with no replacement
- [ ] Can someone locate focus throughout the keyboard path?
- [ ] Is the indicator distinguishable wherever it is drawn?
- [ ] Does it remain visible under zoom, clipping and forced colors?
- Reasoning: `references/rules/a11y-1.md`

## Carry meaning beyond color (`a11y-2`)

When color communicates an error, state or category, add a second cue someone can perceive without distinguishing the hues. For a detected form error, identify the field and describe the problem in text.

- Do: Red text + error icon + message · Don't: Only a red border on the input
- [ ] Can someone tell the two states apart without their hues?
- [ ] Does the message explain what needs correcting?
- [ ] Does the nonvisual presentation carry the same meaning?
- Reasoning: `references/rules/a11y-2.md`

## Separate competing touch targets (`a11y-3`)

Leave space between nearby actions when an unintended tap would be costly. An 8px gutter protects the particular miss shown here. WCAG sets size and spacing tests rather than one minimum gap for every button.

- Do: Buttons: 8px gutter · Don't: Buttons: 0px gutter
- [ ] Where does a near miss land?
- [ ] Do expanded hit areas overlap?
- [ ] Is the protection appropriate to the cost of choosing the wrong action?
- Reasoning: `references/rules/a11y-3.md`

## Offer a click or tap path for every drag (`a11y-4`)

Offer clicks or taps for tasks such as reordering a list, moving cards between columns or setting a slider. A drag can be required when the drawn path itself is essential to the task.

- Do: Drag handle + Move up / Move down · Don't: Drag handle only
- [ ] On a touch screen, tap Move up once on Book room in position 2. Does it reach position 1 without holding or dragging?
- [ ] Can taps reach every destination or value the drag can reach?
- [ ] Do both input paths produce the same saved order or value?
- Reasoning: `references/rules/a11y-4.md`

## Choose heading levels by outline, not size (`a11y-5`)

Choose heading levels from the page's section hierarchy. Style the headings independently so the visual sizes and the screen reader's heading list can both reflect the design.

- Do: h1 Settings → h2 Billing → h3 Invoices · Don't: h1 Settings → h4 Billing → h4 Invoices
- [ ] Open Settings, then open the screen reader’s heading list. Does it read Settings at level 1, Billing at level 2 and Invoices at level 3?
- [ ] If the designer shrinks Billing, does it stay a level 2 heading?
- [ ] Do sections at the same depth use the same heading level?
- Reasoning: `references/rules/a11y-5.md`

## Let people pause what moves or updates on its own (`a11y-6`)

For nonessential content presented alongside other content, offer a way to pause, stop or hide automatic movement, blinking or scrolling that lasts more than five seconds. For automatic updates, offer a control at any interval. Adjusting the update frequency also works.

- Do: Testimonial strip with Pause · Don't: Quote changes every 4s · no control
- [ ] Load the strip, wait for a quote to change, then use Tab and Space to pause it. After two four-second intervals, is the same quote still visible?
- [ ] Does the strip stay paused when focus leaves the control?
- [ ] Can someone tell that the strip is paused before resuming it?
- Reasoning: `references/rules/a11y-6.md`

## Underline links in running text (`a11y-7`)

Underline inline links so readers can spot them as they read. Navigation menus can use their layout and placement to identify links.

- Do: p a { text-decoration: underline } · Don't: p a { text-decoration: none } · color only
- [ ] Turn on grayscale, move the pointer off the paragraph and read the sentence. Can you find the sharing guide link before interacting with it?
- [ ] Does a visited inline link retain an underline or a sufficient visual cue at rest?
- [ ] If a prose link uses G183, does the contrast pass at rest, and does the cue appear on both hover and focus?
- Reasoning: `references/rules/a11y-7.md`

## Return focus when an overlay closes (`a11y-8`)

When an overlay closes, return keyboard focus to the control that opened it. If closing removes that control, such as when a row is deleted, focus the next logical control in the workflow.

- Do: Esc → focus back on "Edit" · Don't: Esc, then Tab → focus restarts at "New project"
- [ ] Tab to Edit for Quarterly report, press Enter, then Esc. Is the focus outline back on Edit before you press Tab again?
- [ ] Do Cancel and Save also put focus where the task should continue?
- [ ] Delete the row from the dialog. Does focus land on the next logical control after the row disappears?
- Reasoning: `references/rules/a11y-8.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `layout-12` Keep scroll and focus targets clear of sticky headers (`references/checklists/layout.md`)
- `color-6` Give essential control edges enough contrast (`references/checklists/color.md`)
- `color-9` Accessible contrast ratios (`references/checklists/color.md`)
- `comp-12` Make overlay dismissal discoverable (`references/checklists/components.md`)
- `comp-13` Make the chart’s question answerable in text (`references/checklists/components.md`)
- `comp-14` Navigate with links, act with buttons (`references/checklists/components.md`)
- `form-2` Keep field labels visible (`references/checklists/forms.md`)
- `form-13` Accept a complete sign-in code in one paste (`references/checklists/forms.md`)
- `form-14` Declare what each field expects (`references/checklists/forms.md`)
- `sys-3` Size the hit area for the input (`references/checklists/system.md`)
- `sys-8` Follow the keyboard model for each control (`references/checklists/system.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/checklists/system.md`)
- `sys-16` Keep errors and the only recovery action on screen (`references/checklists/system.md`)
- `motion-2` Keep keyboard input responsive (`references/checklists/motion.md`)
- `motion-17` Preserve feedback with reduced motion (`references/checklists/motion.md`)
