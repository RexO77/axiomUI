# Accessibility & inclusivity

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Keep keyboard focus visible (`a11y-1`)

Keep a visible indicator on keyboard focus. A custom focus treatment should remain identifiable across the surfaces and display modes where the control appears.

- Do: focus-visible:outline-2 outline-offset-2
- Don't: outline: none with no replacement
- Reasoning: `references/rules/a11y-1.md` · https://axiomui.nischal.fyi/rules/a11y-1

## Carry meaning beyond color (`a11y-2`)

When color communicates an error, state or category, add a second cue someone can perceive without distinguishing the hues. For a detected form error, identify the field and describe the problem in text.

- Do: Red text + error icon + message
- Don't: Only a red border on the input
- Reasoning: `references/rules/a11y-2.md` · https://axiomui.nischal.fyi/rules/a11y-2

## Separate competing touch targets (`a11y-3`)

Leave space between nearby actions when an unintended tap would be costly. An 8px gutter protects the particular miss shown here. WCAG sets size and spacing tests rather than one minimum gap for every button.

- Do: Buttons: 8px gutter
- Don't: Buttons: 0px gutter
- Reasoning: `references/rules/a11y-3.md` · https://axiomui.nischal.fyi/rules/a11y-3

## Offer a click or tap path for every drag (`a11y-4`)

Offer clicks or taps for tasks such as reordering a list, moving cards between columns or setting a slider. A drag can be required when the drawn path itself is essential to the task.

- Do: Drag handle + Move up / Move down
- Don't: Drag handle only
- Reasoning: `references/rules/a11y-4.md` · https://axiomui.nischal.fyi/rules/a11y-4

## Choose heading levels by outline, not size (`a11y-5`)

Choose heading levels from the page's section hierarchy. Style the headings independently so the visual sizes and the screen reader's heading list can both reflect the design.

- Do: h1 Settings → h2 Billing → h3 Invoices
- Don't: h1 Settings → h4 Billing → h4 Invoices
- Reasoning: `references/rules/a11y-5.md` · https://axiomui.nischal.fyi/rules/a11y-5

## Let people pause what moves or updates on its own (`a11y-6`)

For nonessential content presented alongside other content, offer a way to pause, stop or hide automatic movement, blinking or scrolling that lasts more than five seconds. For automatic updates, offer a control at any interval. Adjusting the update frequency also works.

- Do: Testimonial strip with Pause
- Don't: Quote changes every 4s · no control
- Reasoning: `references/rules/a11y-6.md` · https://axiomui.nischal.fyi/rules/a11y-6

## Underline links in running text (`a11y-7`)

Underline inline links so readers can spot them as they read. Navigation menus can use their layout and placement to identify links.

- Do: p a { text-decoration: underline }
- Don't: p a { text-decoration: none } · color only
- Reasoning: `references/rules/a11y-7.md` · https://axiomui.nischal.fyi/rules/a11y-7

## Return focus when an overlay closes (`a11y-8`)

When an overlay closes, return keyboard focus to the control that opened it. If closing removes that control, such as when a row is deleted, focus the next logical control in the workflow.

- Do: Esc → focus back on "Edit"
- Don't: Esc, then Tab → focus restarts at "New project"
- Reasoning: `references/rules/a11y-8.md` · https://axiomui.nischal.fyi/rules/a11y-8

## Related rules in other domains

- `layout-12` Keep scroll and focus targets clear of sticky headers (`references/layout.md`)
- `color-6` Give essential control edges enough contrast (`references/color.md`)
- `color-9` Accessible contrast ratios (`references/color.md`)
- `comp-12` Make overlay dismissal discoverable (`references/components.md`)
- `comp-13` Make the chart’s question answerable in text (`references/components.md`)
- `comp-14` Navigate with links, act with buttons (`references/components.md`)
- `form-2` Keep field labels visible (`references/forms.md`)
- `form-13` Accept a complete sign-in code in one paste (`references/forms.md`)
- `form-14` Declare what each field expects (`references/forms.md`)
- `sys-3` Size the hit area for the input (`references/system.md`)
- `sys-8` Follow the keyboard model for each control (`references/system.md`)
- `sys-11` Keep the task usable at 320 CSS pixels (`references/system.md`)
- `sys-16` Keep errors and the only recovery action on screen (`references/system.md`)
- `motion-2` Keep keyboard input responsive (`references/motion.md`)
- `motion-17` Preserve feedback with reduced motion (`references/motion.md`)
