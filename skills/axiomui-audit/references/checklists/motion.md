# Motion & interaction checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Shorten entrances for frequent actions (`motion-1`)

Open the command palette several times in a row. If you keep waiting for its entrance, shorten it or remove it.

- Do: Rare modal: 220ms · Don’t: Frequent palette: 220ms per open
- [ ] How soon can someone use the first result after opening the palette?
- [ ] Does anything move under the pointer as the user reaches for the next action?
- [ ] What does the entrance explain on the tenth open?
- Reasoning: `references/rules/motion-1.md`

## Focus the palette field on open (`motion-2`)

When a shortcut opens a command palette, focus its field immediately so people can type while it opens.

- Do: Focus on open. First keystrokes land. · Don’t: Focus after entrance. First keystrokes are lost.
- [ ] Does the first character appear in the query?
- [ ] Where does focus return after Escape during entry?
- [ ] Can the user see the currently focused control throughout?
- Reasoning: `references/rules/motion-2.md`

## Use motion to show what changed (`motion-3`)

Use motion to show where a panel came from or which action succeeded. Save a bounce for a change worth drawing attention to.

- Do: Details panel slides in from the right · Don’t: Dialog grows past its final size
- [ ] Can someone tell which edge the Details panel came from?
- [ ] Does the animation call attention to the right event?
- [ ] Does the end state communicate the result with reduced motion enabled?
- Reasoning: `references/rules/motion-3.md`

## Ease out when a panel needs to settle early (`motion-4`)

A strong ease-out covers most of the distance early. Use it when people need to read a panel as it opens.

- Do: cubic-bezier(0.23, 1, 0.32, 1) · Don’t: ease — cubic-bezier(0.25, 0.1, 0.25, 1)
- [ ] How far has the panel moved when the user starts reading?
- [ ] Does the largest instance appear to jump?
- [ ] Does a simpler curve communicate the same transition?
- Reasoning: `references/rules/motion-4.md`

## Match duration to travel distance (`motion-6`)

Start with 180ms for a small menu and watch it open at normal speed. A panel that travels farther may need more time to follow.

- Do: Menu: 180ms · Don’t: Menu: 500ms
- [ ] Can a user select an item while the menu opens?
- [ ] Is the destination easy to follow on a wide screen?
- [ ] Does the transition still help after several uses?
- Reasoning: `references/rules/motion-6.md`

## Tune entrance and exit separately (`motion-7`)

Give people time to notice a toast as it enters. Once they dismiss it, a short exit lets them move on.

- Do: Enter 220ms, exit 160ms · Don’t: Enter 360ms, exit 360ms
- [ ] Can the message be read before it goes away?
- [ ] Where does the next click or keystroke go?
- [ ] Does the destination of a moving item remain clear?
- Reasoning: `references/rules/motion-7.md`

## Show when a control is pressed (`motion-8`)

Give a press an immediate visible state. A slight scale, fill or border change can work. Keep the control legible and preserve its hit area.

- Do: Pressed button face · scale(0.96) · Don’t: Pressed button face · scale(0.90)
- [ ] Can a press near an edge finish or cancel predictably?
- [ ] Is the label still sharp and readable while held?
- [ ] Can the pressed state be recognized without movement?
- Reasoning: `references/rules/motion-8.md`

## Start panels near full size (`motion-9`)

Start menus and panels close to full size so their labels stay readable. A small scale change or a fade can mark the entrance.

- Do: scale(0.95) + opacity 0 · Don’t: scale(0) + opacity 0
- [ ] Can the user identify the menu as it appears?
- [ ] How far do its outer edges travel?
- [ ] Does scaling add information beyond the fade?
- Reasoning: `references/rules/motion-9.md`

## Anchor a popover’s motion to its trigger (`motion-10`)

When a popover scales in, set its transform origin at the edge nearest its button. If it flips to the other side to fit, move the origin with it.

- Do: transform-origin: top left · Don’t: transform-origin: center
- [ ] Does the origin stay on the correct edge when the menu flips?
- [ ] Does it line up with an off-center trigger?
- [ ] Would a simple fade work better for a dialog without an anchor?
- Reasoning: `references/rules/motion-10.md`

## Delay only the first hover tooltip in a toolbar (`motion-11`)

Wait 300ms before opening the first tooltip on hover. Then show neighboring tooltips immediately. Restore the delay after the pointer has been away for 300ms.

- Do: Hover delay · 300ms first, then 0ms · Don’t: Hover delay · 300ms on every tool
- [ ] Do any tooltips flash when you move quickly across the toolbar?
- [ ] Can someone travel from a trigger onto its tip?
- [ ] After leaving and returning, does the initial delay reset?
- Reasoning: `references/rules/motion-11.md`

## Reverse motion from its current position (`motion-12`)

If a control reverses mid-animation, turn it back from where it is. A CSS transition does this automatically. With keyframes, reverse the running animation to avoid a jump.

- Do: transition: transform 420ms · Don’t: Restart from a fixed endpoint (420ms)
- [ ] Does the object jump when its destination changes?
- [ ] After two quick reversals, does the control’s accessible state match its final setting?
- [ ] Can a stale completion handler undo a newer choice?
- Reasoning: `references/rules/motion-12.md`

## Give new elements a starting style (`motion-13`)

Use @starting-style for a CSS transition on newly rendered content. Leave the normal style visible so the content remains usable if the entry animation is skipped.

- Do: .row { @starting-style { opacity: 0 } } · Don’t: Row appears immediately on insertion
- [ ] Does the row appear on its first insertion?
- [ ] Can you see the row before a script runs to reveal it?
- [ ] Does removing the animation leave the information accessible?
- Reasoning: `references/rules/motion-13.md`

## Use a transform when neighbors can stay in place (`motion-14`)

Use a transform to move an element while its neighbors stay put. Use opacity to fade it. If nearby content must move aside, animate the height and check for dropped frames.

- Do: translateY · Don’t: Animating height for a visual slide
- [ ] Are surrounding elements in the right places throughout?
- [ ] Can the keyboard still reach each visible control?
- [ ] What does the performance trace show while other work runs?
- Reasoning: `references/rules/motion-14.md`

## Base slide exits on the element’s height (`motion-15`)

To slide a toast off screen, move it by its own height plus the gap to the clipping edge. A percentage in translateY() scales with the toast’s height.

- Do: translateY(150%) · Don’t: translateY(40px)
- [ ] Does the tallest toast clear the boundary?
- [ ] Does the shortest toast also clear its inset?
- [ ] Can focus reach the dismissed content?
- Reasoning: `references/rules/motion-15.md`

## Show hover effects only where hover exists (`motion-16`)

Enable hover-only effects when the primary input can hover. Keep every action available through touch and keyboard, including on devices with several input types.

- Do: @media (hover: hover) · Don’t: Button scales on tap
- [ ] Can the control be identified before hovering?
- [ ] Does the action work with focus and activation from a keyboard?
- [ ] What happens when the user switches from trackpad to touch?
- Reasoning: `references/rules/motion-16.md`

## Preserve feedback with reduced motion (`motion-17`)

When reduced motion is on, remove unnecessary travel, zoom and spin. Keep the result visible with a label or icon.

- Do: With motion on, the toast fades in place · Don’t: With motion on, the toast slides up
- [ ] With motion reduced, what tells the user the action succeeded?
- [ ] Do both CSS and JavaScript honor a preference change?
- [ ] Which movements are essential to the information or function?
- Reasoning: `references/rules/motion-17.md`

## Let a quick flick dismiss a card (`motion-18`)

For a swipe dismissal people can undo, accept a short, fast flick as well as a long drag. Check the direction and recent speed when they release.

- Do: Dismiss on a long drag or a fast flick toward the edge · Don’t: Dismiss on a long drag only
- [ ] Does a stationary release below the distance threshold keep the card?
- [ ] Does a canceled pointer leave the item intact?
- [ ] Can someone complete the same action with a single tap or click?
- Reasoning: `references/rules/motion-18.md`

## Add resistance past a drag limit (`motion-19`)

When a card reaches its drag limit, let it move less with each extra pixel of pull. On release, return it to rest. Leave native scroll bounce alone and keep sliders within their valid range.

- Do: Past the limit, the card moves less with each extra pixel of pull · Don’t: Card stops abruptly at the limit
- [ ] What does movement beyond the edge mean here?
- [ ] Can someone mistake overshoot for a valid value?
- [ ] Does releasing or canceling show the correct resting state?
- Reasoning: `references/rules/motion-19.md`

## Keep tracking the pointer that started the drag (`motion-20`)

Capture the pointer that starts the drag so it keeps working outside the handle. End the drag when that pointer is released or the gesture is canceled.

- Do: Tracks outside the frame until release or cancel · Don’t: Stops tracking outside the frame
- [ ] Does a mouse drag continue outside the handle?
- [ ] Can a second finger take over unexpectedly?
- [ ] Can scrolling, cancellation or loss of capture leave the control stuck?
- Reasoning: `references/rules/motion-20.md`

## Keep decorative motion independent of busy scripts (`motion-21`)

For a move between two fixed positions, use a CSS transform transition. If the browser runs it on the compositor, it can keep moving while a long JavaScript task blocks frame callbacks.

- Do: CSS transform transition · Don’t: JavaScript updates the transform every frame
- [ ] Which updates require JavaScript on every frame?
- [ ] Does the indicator actually keep moving on the target device?
- [ ] How long does a click or keypress wait during a long task?
- Reasoning: `references/rules/motion-21.md`

## Cap the total stagger time (`motion-24`)

Stagger rows when their order helps people follow a change. Check when the last row finishes. As the list grows, shorten the delay or show the rows together.

- Do: Three rows start 60ms apart · Don’t: Three rows start 220ms apart
- [ ] When does the last row finish its entrance?
- [ ] What happens when the list has thirty items?
- [ ] Can someone tab to or click an invisible result?
- Reasoning: `references/rules/motion-24.md`

## Make icon state changes recognizable (`motion-28`)

When an icon changes, keep the new icon recognizable as it appears and at rest. Swap it instantly or crossfade without blur.

- Do: New icon stays sharp as it appears · Don’t: Blur hides the new icon’s shape
- [ ] Can someone identify the final state after looking away?
- [ ] Does focus stay on the control, and does its accessible name still describe its action?
- [ ] Does the glyph remain understandable without movement?
- Reasoning: `references/rules/motion-28.md`

## Show ready controls on first paint (`motion-29`)

Render controls that are already available in their usable state. Reserve an entrance for a later change the user needs to notice.

- Do: Ready controls render in place on first paint · Don’t: Ready controls fade and slide into place on load
- [ ] Which content is known before the first render?
- [ ] Can the user locate the initial focus target immediately?
- [ ] When a new item appears, can you tell what was added?
- Reasoning: `references/rules/motion-29.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `sys-13` Limit transitions to intended properties (`references/checklists/system.md`)
- `a11y-4` Offer a click or tap alternative to dragging (`references/checklists/accessibility.md`)
- `a11y-6` Let people pause what moves or updates on its own (`references/checklists/accessibility.md`)
