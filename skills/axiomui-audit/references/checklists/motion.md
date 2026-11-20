# Motion & interaction checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Animate by frequency (`motion-1`)

- Do: Rare modal: 220ms · Don't: Frequent palette: 220ms
- [ ] Where does the first keystroke land?
- [ ] Does anything move under the pointer as the user reaches for the next action?
- [ ] What does the entrance explain on the tenth open?
- Reasoning: `references/rules/motion-1.md`

## Keep keyboard input responsive (`motion-2`)

- Do: Keyboard panel: 0ms · Don't: Keyboard panel: 240ms
- [ ] Does the first character appear in the query?
- [ ] Where does focus return after Escape during entry?
- [ ] Can the user see the currently focused control throughout?
- Reasoning: `references/rules/motion-2.md`

## Purpose before motion (`motion-3`)

- Do: Drawer slides from its edge · Don't: Modal bounces in
- [ ] Can someone explain where the drawer went?
- [ ] Does the animation call attention to the right event?
- [ ] Does the end state communicate the result with reduced motion enabled?
- Reasoning: `references/rules/motion-3.md`

## Choose easing for the movement (`motion-4`)

- Do: cubic-bezier(0.23, 1, 0.32, 1) · Don't: ease — cubic-bezier(0.25, 0.1, 0.25, 1)
- [ ] How far has the panel moved when the user starts reading?
- [ ] Does the largest instance appear to jump?
- [ ] Does a simpler curve communicate the same transition?
- Reasoning: `references/rules/motion-4.md`

## Make the start of an entrance visible (`motion-5`)

- Do: Menu open: ease-out · Don't: Menu open: ease-in
- [ ] What is the first visible response to the press?
- [ ] Does the trigger still provide feedback with animation disabled?
- [ ] Does the exit communicate where the panel is going?
- Reasoning: `references/rules/motion-5.md`

## Time motion to the task (`motion-6`)

- Do: Menu: 180ms · Don't: Menu: 500ms
- [ ] Can a user select an item while the menu opens?
- [ ] Is the destination easy to follow on a wide screen?
- [ ] Does the transition still help after several uses?
- Reasoning: `references/rules/motion-6.md`

## Tune entrance and exit separately (`motion-7`)

- Do: Enter 220ms, exit 160ms · Don't: Enter 360ms, exit 360ms
- [ ] Can the message be read before it goes away?
- [ ] Where does the next click or keystroke go?
- [ ] Does the destination of a moving item remain clear?
- Reasoning: `references/rules/motion-7.md`

## Show when a control is pressed (`motion-8`)

- Do: button:active scale(0.96) · Don't: button:active scale(0.90)
- [ ] Can a press near an edge finish or cancel predictably?
- [ ] Is the label still sharp and readable while held?
- [ ] Can the pressed state be recognized without movement?
- Reasoning: `references/rules/motion-8.md`

## Keep surface entrances near full size (`motion-9`)

- Do: scale(0.95) + opacity 0 · Don't: scale(0) + opacity 0
- [ ] Can the user identify the menu as it appears?
- [ ] How far do its outer edges travel?
- [ ] Does scaling add information beyond the fade?
- Reasoning: `references/rules/motion-9.md`

## Anchor a popover’s motion to its trigger (`motion-10`)

- Do: transform-origin: the trigger · Don't: transform-origin: center
- [ ] Does the origin stay on the correct edge when the menu flips?
- [ ] Does it line up with an off-center trigger?
- [ ] Would a simple fade work better for a dialog without an anchor?
- Reasoning: `references/rules/motion-10.md`

## Share tooltip timing across a toolbar (`motion-11`)

- Do: First tooltip 300ms, then 0ms · Don't: Every tooltip 300ms
- [ ] Does a pass across unopened tools avoid a flash of unwanted tips?
- [ ] Can someone travel from a trigger onto its tip?
- [ ] After leaving and returning, does the initial delay reset?
- Reasoning: `references/rules/motion-11.md`

## Retarget interrupted motion from its current position (`motion-12`)

- Do: transition: transform 420ms · Don't: animation: turn 420ms
- [ ] Does the object jump when its destination changes?
- [ ] Does the semantic state reflect the latest input?
- [ ] Can a stale completion handler undo a newer choice?
- Reasoning: `references/rules/motion-12.md`

## Give new elements a starting style (`motion-13`)

- Do: .row { @starting-style { opacity: 0 } } · Don't: useEffect(() => setShown(true))
- [ ] Does the row appear on its first insertion?
- [ ] Is its ordinary computed style visible?
- [ ] Does removing the animation leave the information accessible?
- Reasoning: `references/rules/motion-13.md`

## Choose animation properties with layout in mind (`motion-14`)

- Do: translateY + opacity · Don't: height
- [ ] Are surrounding elements in the right places throughout?
- [ ] Can the keyboard still reach each visible control?
- [ ] What does the performance trace show while other work runs?
- Reasoning: `references/rules/motion-14.md`

## Size slide exits to the moving element (`motion-15`)

- Do: translateY(150%) · Don't: translateY(40px)
- [ ] Does the tallest toast clear the boundary?
- [ ] Does the shortest toast also clear its inset?
- [ ] Can focus reach the dismissed content?
- Reasoning: `references/rules/motion-15.md`

## Gate decorative hover motion (`motion-16`)

- Do: @media (hover: hover) · Don't: Hover scale on touch
- [ ] Can the control be identified before hovering?
- [ ] Does the action work with focus and activation from a keyboard?
- [ ] What happens when the user switches from trackpad to touch?
- Reasoning: `references/rules/motion-16.md`

## Preserve feedback with reduced motion (`motion-17`)

- Do: Reduced motion: fade in place · Don't: Reduced motion: slides anyway
- [ ] With motion reduced, what tells the user the action succeeded?
- [ ] Do both CSS and JavaScript honor a preference change?
- [ ] Which movements are essential to the information or function?
- Reasoning: `references/rules/motion-17.md`

## Use release direction and speed for swipe dismissal (`motion-18`)

- Do: Dismiss on distance or velocity · Don't: Distance-only swipe threshold
- [ ] Does a stationary release below the distance threshold keep the card?
- [ ] Does a canceled pointer leave the item intact?
- [ ] Can someone complete the same action with a single tap or click?
- Reasoning: `references/rules/motion-18.md`

## Use drag resistance where overshoot is meaningful (`motion-19`)

- Do: Increasing friction past edge · Don't: Invisible wall stop
- [ ] What does movement beyond the edge mean here?
- [ ] Can someone mistake overshoot for a valid value?
- [ ] Does releasing or canceling show the correct resting state?
- Reasoning: `references/rules/motion-19.md`

## Keep a drag attached to its initiating pointer (`motion-20`)

- Do: setPointerCapture on drag start · Don't: No pointer capture on drag start
- [ ] Does a mouse drag continue outside the handle?
- [ ] Can a second finger take over unexpectedly?
- [ ] Can scrolling, cancellation or loss of capture leave the control stuck?
- Reasoning: `references/rules/motion-20.md`

## Keep decorative motion independent of busy scripts (`motion-21`)

- Do: Tab indicator: CSS transition · Don't: Tab indicator: rAF + style writes
- [ ] Which updates require JavaScript on every frame?
- [ ] Does the indicator actually keep moving on the target device?
- [ ] Can the user activate the destination during the work?
- Reasoning: `references/rules/motion-21.md`

## Use a playback controller for programmatic animation (`motion-22`)

- Do: element.animate() on transform · Don't: setInterval transform every 80ms
- [ ] Can playback reverse or pause without creating another competing animation?
- [ ] What state remains after cancellation?
- [ ] Is a coarse timer visibly stepping through an otherwise continuous movement?
- Reasoning: `references/rules/motion-22.md`

## Scope rapidly changing drag styles (`motion-23`)

- Do: element.style.transform · Don't: Parent --swipe-amount variable
- [ ] Which descendants need to change with the card?
- [ ] Does the trace show style work outside those consumers?
- [ ] Does the difference remain on representative content and hardware?
- Reasoning: `references/rules/motion-23.md`

## Limit the total stagger (`motion-24`)

- Do: 60ms between three row starts · Don't: 220ms between items
- [ ] How long does the last useful item take to appear?
- [ ] What happens when the list has thirty items?
- [ ] Can someone tab to or click an invisible result?
- Reasoning: `references/rules/motion-24.md`

## Review motion slowly, then at normal speed (`motion-25`)

- Do: Inspect at 2x-5x duration · Don't: Judge only at full speed
- [ ] Which property creates the unexpected frame?
- [ ] Is an offset deliberate and useful at normal speed?
- [ ] Does a real input interrupt the sequence cleanly?
- Reasoning: `references/rules/motion-25.md`

## Sequence panel content when order explains something (`motion-26`)

- Do: Title, copy, actions staggered 90ms · Don't: Title, copy, actions in one fade
- [ ] What information does the order reveal?
- [ ] Can the user see and use the initial focus target immediately?
- [ ] Does the hierarchy remain clear with every group displayed together?
- Reasoning: `references/rules/motion-26.md`

## Keep routine exits quiet (`motion-27`)

- Do: opacity 0 + translateY(-12px) at 150ms · Don't: translateY(-100%) scale(0.5) at 400ms
- [ ] Where does the next action take place?
- [ ] Does the departure explain a destination when one exists?
- [ ] Can the leaving element still block input after it disappears?
- Reasoning: `references/rules/motion-27.md`

## Make icon state changes recognizable (`motion-28`)

- Do: scale 0.25 → 1, opacity 0 → 1, blur 4px → 0 · Don't: display: none to display: block
- [ ] Can someone identify the final state after looking away?
- [ ] Does the control retain its name and focus during the swap?
- [ ] Does the glyph remain understandable without movement?
- Reasoning: `references/rules/motion-28.md`

## Show the initial interface in its ready state (`motion-29`)

- Do: AnimatePresence initial={false} · Don't: AnimatePresence initial={true}
- [ ] Which content is known before the first render?
- [ ] Can the user locate the initial focus target immediately?
- [ ] Does the later insertion still communicate a meaningful change?
- Reasoning: `references/rules/motion-29.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `sys-13` Limit transitions to intended properties (`references/checklists/system.md`)
- `sys-14` Use will-change sparingly (`references/checklists/system.md`)
