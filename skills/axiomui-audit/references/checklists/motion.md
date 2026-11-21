# Motion & interaction checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Animate by frequency (`motion-1`)

Watch a frequent action several times in succession. Shorten its entrance when it gets between the user and the next input.

- Do: Rare modal: 220ms · Don't: Frequent palette: 220ms
- [ ] Where does the first keystroke land?
- [ ] Does anything move under the pointer as the user reaches for the next action?
- [ ] What does the entrance explain on the tenth open?
- Reasoning: `references/rules/motion-1.md`

## Keep keyboard input responsive (`motion-2`)

When a shortcut opens a command palette, move focus into the field and accept the next keystroke while the panel settles.

- Do: Focus on open. First keystrokes land. · Don't: Focus after entrance. First keystrokes are lost.
- [ ] Does the first character appear in the query?
- [ ] Where does focus return after Escape during entry?
- [ ] Can the user see the currently focused control throughout?
- Reasoning: `references/rules/motion-2.md`

## Purpose before motion (`motion-3`)

Use movement to show where a panel came from, what changed, or which action succeeded. Keep occasional expressive moments proportionate to their importance.

- Do: Drawer slides from its edge · Don't: Modal bounces in
- [ ] Can someone explain where the drawer went?
- [ ] Does the animation call attention to the right event?
- [ ] Does the end state communicate the result with reduced motion enabled?
- Reasoning: `references/rules/motion-3.md`

## Choose easing for the movement (`motion-4`)

For an entrance, compare how much ground each curve covers before the content needs to be read. Use a stronger ease-out when the panel should reach its resting position early.

- Do: cubic-bezier(0.23, 1, 0.32, 1) · Don't: ease — cubic-bezier(0.25, 0.1, 0.25, 1)
- [ ] How far has the panel moved when the user starts reading?
- [ ] Does the largest instance appear to jump?
- [ ] Does a simpler curve communicate the same transition?
- Reasoning: `references/rules/motion-4.md`

## Time motion to the task (`motion-6`)

Use short transitions for nearby controls. Start with 180ms for a small menu and compare it at normal speed. Larger changes in position or context can need longer.

- Do: Menu: 180ms · Don't: Menu: 500ms
- [ ] Can a user select an item while the menu opens?
- [ ] Is the destination easy to follow on a wide screen?
- [ ] Does the transition still help after several uses?
- Reasoning: `references/rules/motion-6.md`

## Tune entrance and exit separately (`motion-7`)

A toast can arrive slowly enough to locate and leave quickly once dismissed. Choose each direction’s timing for what the user needs to follow.

- Do: Enter 220ms, exit 160ms · Don't: Enter 360ms, exit 360ms
- [ ] Can the message be read before it goes away?
- [ ] Where does the next click or keystroke go?
- [ ] Does the destination of a moving item remain clear?
- Reasoning: `references/rules/motion-7.md`

## Show when a control is pressed (`motion-8`)

Give a press an immediate visible state. A slight scale, fill or border change can work. Keep the control legible and preserve its hit area.

- Do: button:active scale(0.96) · Don't: button:active scale(0.90)
- [ ] Can a press near an edge finish or cancel predictably?
- [ ] Is the label still sharp and readable while held?
- [ ] Can the pressed state be recognized without movement?
- Reasoning: `references/rules/motion-8.md`

## Keep surface entrances near full size (`motion-9`)

When a panel contains text or controls, begin near its reading size. Use a small scale change or fade if the entrance needs emphasis.

- Do: scale(0.95) + opacity 0 · Don't: scale(0) + opacity 0
- [ ] Can the user identify the menu as it appears?
- [ ] How far do its outer edges travel?
- [ ] Does scaling add information beyond the fade?
- Reasoning: `references/rules/motion-9.md`

## Anchor a popover’s motion to its trigger (`motion-10`)

If an anchored popover scales, put the transform origin on the edge facing the trigger. Recompute it after a collision changes placement.

- Do: transform-origin: the trigger · Don't: transform-origin: center
- [ ] Does the origin stay on the correct edge when the menu flips?
- [ ] Does it line up with an off-center trigger?
- [ ] Would a simple fade work better for a dialog without an anchor?
- Reasoning: `references/rules/motion-10.md`

## Share tooltip timing across a toolbar (`motion-11`)

Delay the first hover tooltip while a pointer crosses the toolbar. Once it opens, reveal adjacent tips without another wait. Reset after the pointer leaves the group.

- Do: First tooltip 300ms, then 0ms · Don't: Every tooltip 300ms
- [ ] Does a pass across unopened tools avoid a flash of unwanted tips?
- [ ] Can someone travel from a trigger onto its tip?
- [ ] After leaving and returning, does the initial delay reset?
- Reasoning: `references/rules/motion-11.md`

## Retarget interrupted motion from its current position (`motion-12`)

When a control reverses mid-transition, continue from its visible position. A CSS transition handles ordinary state changes. A controlled keyframe animation can reverse too.

- Do: transition: transform 420ms · Don't: animation: turn 420ms
- [ ] Does the object jump when its destination changes?
- [ ] Does the semantic state reflect the latest input?
- [ ] Can a stale completion handler undo a newer choice?
- Reasoning: `references/rules/motion-12.md`

## Give new elements a starting style (`motion-13`)

Use @starting-style for a CSS transition on newly rendered content. Leave the normal style visible so the content remains usable if the entry animation is skipped.

- Do: .row { @starting-style { opacity: 0 } } · Don't: useEffect(() => setShown(true))
- [ ] Does the row appear on its first insertion?
- [ ] Is its ordinary computed style visible?
- [ ] Does removing the animation leave the information accessible?
- Reasoning: `references/rules/motion-13.md`

## Choose animation properties with layout in mind (`motion-14`)

Use transform and opacity when content can move without rearranging its neighbors. If space must open in the layout, measure the cost of animating the real geometry.

- Do: translateY + opacity · Don't: height
- [ ] Are surrounding elements in the right places throughout?
- [ ] Can the keyboard still reach each visible control?
- [ ] What does the performance trace show while other work runs?
- Reasoning: `references/rules/motion-14.md`

## Size slide exits to the moving element (`motion-15`)

For variable-height content, express vertical travel against the element’s transform reference box. Include any gap to the clipping edge in the exit distance.

- Do: translateY(150%) · Don't: translateY(40px)
- [ ] Does the tallest toast clear the boundary?
- [ ] Does the shortest toast also clear its inset?
- [ ] Can focus reach the dismissed content?
- Reasoning: `references/rules/motion-15.md`

## Gate decorative hover motion (`motion-16`)

Enable hover-only effects when the primary input can hover. Keep every action available through touch and keyboard, including on devices with several input types.

- Do: @media (hover: hover) · Don't: Hover scale on touch
- [ ] Can the control be identified before hovering?
- [ ] Does the action work with focus and activation from a keyboard?
- [ ] What happens when the user switches from trackpad to touch?
- Reasoning: `references/rules/motion-16.md`

## Preserve feedback with reduced motion (`motion-17`)

Honor reduced motion by removing unnecessary travel, zoom and spin. Show the resulting state through a stable label, icon or other persistent cue.

- Do: Reduced motion: fade in place · Don't: Reduced motion: slides anyway
- [ ] With motion reduced, what tells the user the action succeeded?
- [ ] Do both CSS and JavaScript honor a preference change?
- [ ] Which movements are essential to the information or function?
- Reasoning: `references/rules/motion-17.md`

## Use release direction and speed for swipe dismissal (`motion-18`)

For a reversible swipe dismissal, consider a short, deliberate flick as well as a longer drag. Check the direction and recent speed at release.

- Do: Dismiss on distance or velocity · Don't: Distance-only swipe threshold
- [ ] Does a stationary release below the distance threshold keep the card?
- [ ] Does a canceled pointer leave the item intact?
- [ ] Can someone complete the same action with a single tap or click?
- Reasoning: `references/rules/motion-18.md`

## Use drag resistance where overshoot is meaningful (`motion-19`)

When a custom dragged surface reaches a meaningful limit, use bounded resistance to signal the edge. Never re-implement native scroll bounce. Clamp controls that represent a fixed valid range.

- Do: Card yields less as the pull increases · Don't: Card stops abruptly at the limit
- [ ] What does movement beyond the edge mean here?
- [ ] Can someone mistake overshoot for a valid value?
- [ ] Does releasing or canceling show the correct resting state?
- Reasoning: `references/rules/motion-19.md`

## Keep a drag attached to its initiating pointer (`motion-20`)

Keep a drag following the pointer that started it as it leaves the handle. End the drag when that pointer releases or the gesture is canceled.

- Do: Tracks outside the handle until release or cancel · Don't: Stops tracking outside the drag surface
- [ ] Does a mouse drag continue outside the handle?
- [ ] Can a second finger take over unexpectedly?
- [ ] Can scrolling, cancellation or loss of capture leave the control stuck?
- Reasoning: `references/rules/motion-20.md`

## Keep decorative motion independent of busy scripts (`motion-21`)

For fixed movement between two states, try a CSS transform transition. Once a browser can composite it, a busy main thread can delay script callbacks while the visual transition continues.

- Do: Tab indicator: CSS transition · Don't: Tab indicator: rAF + style writes
- [ ] Which updates require JavaScript on every frame?
- [ ] Does the indicator actually keep moving on the target device?
- [ ] Can the user activate the destination during the work?
- Reasoning: `references/rules/motion-21.md`

## Limit the total stagger (`motion-24`)

When a short sequence helps people follow a group of arrivals, budget for the last useful item. Cap or remove delays as the group grows.

- Do: 60ms between three row starts · Don't: 220ms between items
- [ ] How long does the last useful item take to appear?
- [ ] What happens when the list has thirty items?
- [ ] Can someone tab to or click an invisible result?
- Reasoning: `references/rules/motion-24.md`

## Make icon state changes recognizable (`motion-28`)

When an icon changes meaning, keep the incoming glyph recognizable as it appears and at rest. Swap it instantly or use a brief transition that preserves its shape.

- Do: Incoming glyph stays sharp as it appears · Don't: Blur obscures the incoming glyph
- [ ] Can someone identify the final state after looking away?
- [ ] Does the control retain its name and focus during the swap?
- [ ] Does the glyph remain understandable without movement?
- Reasoning: `references/rules/motion-28.md`

## Show the initial interface in its ready state (`motion-29`)

Render controls that are already available in their usable state. Reserve an entrance for a later change the user needs to notice.

- Do: Ready controls render in place on first paint · Don't: Ready controls fade and slide into place on load
- [ ] Which content is known before the first render?
- [ ] Can the user locate the initial focus target immediately?
- [ ] Does the later insertion still communicate a meaningful change?
- Reasoning: `references/rules/motion-29.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `sys-13` Limit transitions to intended properties (`references/checklists/system.md`)
- `a11y-4` Offer a click or tap path for every drag (`references/checklists/accessibility.md`)
- `a11y-6` Let people pause what moves or updates on its own (`references/checklists/accessibility.md`)
