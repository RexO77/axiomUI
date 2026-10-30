# Motion & interaction checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## Animate by frequency (`motion-1`)

- Do: Rare modal: 220ms · Don't: Frequent palette: 220ms
- [ ] Does the command palette open without any perceptible delay?
- [ ] Does a rarely-seen modal still get its full standard motion rather than feeling clipped?
- [ ] Do frequently repeated actions feel faster than one-off actions?
- Reasoning: `references/rules/motion-1.md`

## Keyboard actions stay instant (`motion-2`)

- Do: Keyboard panel: 0ms · Don't: Keyboard panel: 240ms
- [ ] Does pressing a shortcut show its result instantly, with no visible wait?
- [ ] Does the command palette open on keypress without a delay?
- [ ] Does focus move immediately when triggered from the keyboard?
- Reasoning: `references/rules/motion-2.md`

## Purpose before motion (`motion-3`)

- Do: Drawer slides from its edge · Don't: Drawer bounces in
- [ ] Can you name the job of every animation on this screen?
- [ ] Does each panel or view move from the direction it belongs to?
- [ ] Is any motion present purely for decoration, playing on every load?
- Reasoning: `references/rules/motion-3.md`

## Use strong custom easing (`motion-4`)

- Do: cubic-bezier(0.23, 1, 0.32, 1) · Don't: ease — cubic-bezier(0.25, 0.1, 0.25, 1)
- [ ] Has most of the travel happened by the first third of the duration?
- [ ] Is the same custom easing curve reused consistently across similar components?
- [ ] Is any entrance still running on a keyword default like ease?
- Reasoning: `references/rules/motion-4.md`

## Never use ease-in for UI (`motion-5`)

- Do: Menu open: ease-out · Don't: Menu open: ease-in
- [ ] Does the menu begin moving immediately when opened, with no slow start?
- [ ] Do any UI responses appear to hesitate before they begin animating?
- [ ] Is ease-in absent from all entrance and response animations?
- Reasoning: `references/rules/motion-5.md`

## Keep UI motion under 300ms (`motion-6`)

- Do: Menu: 180ms · Don't: Menu: 500ms
- [ ] Does the dropdown finish opening in under 200ms?
- [ ] Does any popover or menu take half a second or longer to appear?
- [ ] Do small UI transitions feel snappy rather than deliberate?
- Reasoning: `references/rules/motion-6.md`

## Asymmetric enter and exit (`motion-7`)

- Do: Enter 220ms, exit 160ms · Don't: Enter 360ms, exit 360ms
- [ ] Does closing an element feel faster than opening it?
- [ ] Are enter and exit using different, deliberately chosen durations?
- [ ] Does dismissing a panel ever feel like it takes as long as opening it?
- Reasoning: `references/rules/motion-7.md`

## Press feedback (`motion-8`)

- Do: button:active scale(0.96) · Don't: button:active scale(0.90)
- [ ] Does every button visibly compress when pressed?
- [ ] Does the press effect feel subtle rather than jarring or exaggerated?
- [ ] Does feedback appear the instant you press down, not after release?
- Reasoning: `references/rules/motion-8.md`

## Never scale from zero (`motion-9`)

- Do: scale(0.95) + opacity 0 · Don't: scale(0) + opacity 0
- [ ] Does the panel appear at nearly full size as it fades in?
- [ ] Is there any element that visibly grows from a single point or zero size?
- [ ] Does the entrance feel like a subtle settle rather than a dramatic pop?
- Reasoning: `references/rules/motion-9.md`

## Origin-aware popovers (`motion-10`)

- Do: transform-origin: the trigger · Don't: transform-origin: center
- [ ] Does the popover visually grow out of the element that triggered it?
- [ ] Does a modal scale from the center of the screen rather than an edge?
- [ ] Does any anchored menu appear to originate from the wrong location?
- Reasoning: `references/rules/motion-10.md`

## Subsequent tooltips are instant (`motion-11`)

- Do: First tooltip 300ms, then 0ms · Don't: Every tooltip 300ms
- [ ] Does the first tooltip in a session wait briefly before appearing?
- [ ] Do adjacent tooltips appear instantly once you’re already hovering the toolbar?
- [ ] Does every toolbar item impose its own separate hover delay?
- Reasoning: `references/rules/motion-11.md`

## Use transitions for interruptible UI (`motion-12`)

- Do: transition: transform 420ms · Don't: animation: turn 420ms
- [ ] Does rapidly re-toggling the control reverse smoothly instead of snapping back?
- [ ] Is a CSS transition, not a keyframe animation, driving this interruptible state?
- [ ] Does the animation ever visibly jump to a start position under fast clicking?
- Reasoning: `references/rules/motion-12.md`

## Use starting styles for entry (`motion-13`)

- Do: @starting-style { opacity: 0 } · Don't: useEffect(() => setShown(true))
- [ ] Does the element animate in immediately on mount without a visible flash?
- [ ] Is entry animation declared in CSS rather than triggered by a JS effect?
- [ ] Does the entrance ever appear to snap into its final state before animating?
- Reasoning: `references/rules/motion-13.md`

## Animate transform and opacity (`motion-14`)

- Do: translateY + opacity · Don't: height + top
- [ ] Does the animation stay smooth even while other work is happening on the page?
- [ ] Is movement driven by transform and opacity rather than top, left, or size properties?
- [ ] Does any panel visibly stutter as it grows or shrinks in height?
- Reasoning: `references/rules/motion-14.md`

## Use percentage transforms (`motion-15`)

- Do: translateY(150%) · Don't: translateY(40px)
- [ ] Does the drawer or toast fully leave the screen regardless of its content length?
- [ ] Is positioning driven by a percentage transform rather than a fixed pixel value?
- [ ] Does any hidden panel show a visible sliver when its content changes size?
- Reasoning: `references/rules/motion-15.md`

## Gate hover motion (`motion-16`)

- Do: @media (hover: hover) · Don't: Hover scale on touch
- [ ] Does tapping a card on a touch device skip the hover animation entirely?
- [ ] Does the hover effect still play correctly with a mouse on desktop?
- [ ] Is there a separate, immediate feedback state for touch taps?
- Reasoning: `references/rules/motion-16.md`

## Reduced motion still has intent (`motion-17`)

- Do: Reduced motion: fade in place · Don't: Reduced motion: slides anyway
- [ ] With reduced motion enabled, does the interface still confirm the action happened?
- [ ] Is movement removed while opacity or color feedback remains?
- [ ] Does no component silently do nothing when reduced motion is on?
- Reasoning: `references/rules/motion-17.md`

## Gesture dismissal uses velocity (`motion-18`)

- Do: Dismiss on distance or velocity · Don't: Distance-only swipe threshold
- [ ] Does a quick short flick dismiss the element even without reaching full distance?
- [ ] Does a slow drag still dismiss once it crosses the distance threshold?
- [ ] Does an accidental slow small nudge correctly snap back instead of dismissing?
- Reasoning: `references/rules/motion-18.md`

## Damp drag boundaries (`motion-19`)

- Do: Increasing friction past edge · Don't: Invisible wall stop
- [ ] Does dragging past the edge still move slightly, with rising resistance, instead of stopping dead?
- [ ] Does releasing past the boundary spring the element back smoothly?
- [ ] Does the resistance feel proportional to how far past the edge the drag goes?
- Reasoning: `references/rules/motion-19.md`

## Capture pointer during drag (`motion-20`)

- Do: setPointerCapture on drag start · Don't: No pointer capture on drag start
- [ ] Does the drag keep following the pointer even when it moves outside the element’s edges?
- [ ] Does introducing a second touch during a drag leave the first drag unaffected?
- [ ] Does releasing the pointer cleanly end the drag without a stuck or jumping element?
- Reasoning: `references/rules/motion-20.md`

## Use CSS under load (`motion-21`)

- Do: Tab indicator: CSS transition · Don't: Tab indicator: rAF + style writes
- [ ] Does the tab motion stay smooth when the main thread is artificially busy?
- [ ] Is the animation defined as a CSS transition rather than a JS interval or rAF loop?
- [ ] Does the motion have a fixed, predetermined timing rather than depending on live data?
- Reasoning: `references/rules/motion-21.md`

## Use WAAPI for programmatic motion (`motion-22`)

- Do: element.animate transform/opacity · Don't: setInterval layout animation
- [ ] Does the programmatic animation stay smooth when triggered by dynamic runtime data?
- [ ] Is the animation built with the Web Animations API rather than setInterval or setTimeout loops?
- [ ] Are only transform and opacity being animated, not width, top, or other layout properties?
- Reasoning: `references/rules/motion-22.md`

## Avoid inheritable motion variables (`motion-23`)

- Do: element.style.transform · Don't: Parent --swipe-amount variable
- [ ] Is the drag transform written directly to the dragged element’s style, not a parent variable?
- [ ] Does dragging stay smooth even inside a deeply nested or large DOM subtree?
- [ ] Does devtools performance recording show no wide style recalculation during the drag?
- Reasoning: `references/rules/motion-23.md`

## Stagger without blocking (`motion-24`)

- Do: 30-80ms between items · Don't: 220ms between items
- [ ] Is the delay between staggered items within roughly 30-80ms rather than a long cascade?
- [ ] Can the user interact with earlier items while later ones are still animating in?
- [ ] Does the stagger actually improve the sense of a related group, not just delay the UI?
- Reasoning: `references/rules/motion-24.md`

## Review motion in slow time (`motion-25`)

- Do: Inspect at 2x-5x duration · Don't: Judge only at full speed
- [ ] Was this animation reviewed at 2x-5x its normal duration before shipping?
- [ ] Do all animated properties stay synchronized when played back slowly?
- [ ] Does any color transition pass through an unintended muddy blend when slowed down?
- Reasoning: `references/rules/motion-25.md`

## Split enter animations (`motion-26`)

- Do: Title, copy, actions staggered 80-100ms · Don't: Title, copy, actions in one fade
- [ ] Do the title, copy, and actions animate in as separate staggered groups?
- [ ] Does the stagger order follow natural reading order, top to bottom?
- [ ] Does the whole panel avoid animating in as one single fading block?
- Reasoning: `references/rules/motion-26.md`

## Subtle exit motion (`motion-27`)

- Do: opacity 0 + translateY(-12px) at 150ms · Don't: translateY(-100%) scale(0.5) at 400ms
- [ ] Does the exit use a small translate and fade rather than a dramatic scale or slide?
- [ ] Is the exit noticeably quicker than the element’s entrance animation?
- [ ] Does surrounding content stay stable in place while the element exits?
- Reasoning: `references/rules/motion-27.md`

## Animate contextual icons (`motion-28`)

- Do: scale 0.25 → 1, opacity 0 → 1, blur 4px → 0 · Don't: display: none to display: block
- [ ] Does the icon scale and fade in rather than snapping into view?
- [ ] Is a blur-to-sharp transition visible as the icon appears?
- [ ] Does the icon disappear with a matching animated transition instead of vanishing instantly?
- Reasoning: `references/rules/motion-28.md`

## Skip default load animation (`motion-29`)

- Do: AnimatePresence initial={false} · Don't: AnimatePresence initial={true}
- [ ] Does content that is open by default appear instantly on first page load, without an enter animation?
- [ ] Does that same component still animate normally when the user closes and reopens it later?
- [ ] Is initial={false} set on AnimatePresence for this component?
- Reasoning: `references/rules/motion-29.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `sys-13` Transition only what changes (`references/checklists/system.md`)
- `sys-14` Use will-change sparingly (`references/checklists/system.md`)
