# Motion & interaction

Compact Do/Don't for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Animate by frequency (`motion-1`)

The more often a user sees an interaction, the less motion it should have. Frequent actions should feel instant.

- Do: Rare modal: 220ms
- Don't: Frequent palette: 220ms
- Reasoning: `references/rules/motion-1.md` · https://axiomui.nischal.fyi/rules/motion-1

## Keyboard actions stay instant (`motion-2`)

Keyboard-driven actions are repeated constantly. Do not animate shortcuts, command palettes, or focus movement in ways that delay the result.

- Do: Keyboard panel: 0ms
- Don't: Keyboard panel: 240ms
- Reasoning: `references/rules/motion-2.md` · https://axiomui.nischal.fyi/rules/motion-2

## Purpose before motion (`motion-3`)

Every animation needs a job: orientation (where am I?), feedback (did it work?), explanation, continuity (what changed?), or softening a jarring state change. If you can't name the job, cut the animation.

- Do: Drawer slides from its edge
- Don't: Drawer bounces in
- Reasoning: `references/rules/motion-3.md` · https://axiomui.nischal.fyi/rules/motion-3

## Use strong custom easing (`motion-4`)

Default CSS easings are often too weak. Use intentional curves like strong ease-out for entrances and ease-in-out for on-screen movement.

- Do: cubic-bezier(0.23, 1, 0.32, 1)
- Don't: ease — cubic-bezier(0.25, 0.1, 0.25, 1)
- Reasoning: `references/rules/motion-4.md` · https://axiomui.nischal.fyi/rules/motion-4

## Never use ease-in for UI (`motion-5`)

Ease-in starts slow at the exact moment the user expects feedback. UI entrances and responses should move immediately.

- Do: Menu open: ease-out
- Don't: Menu open: ease-in
- Reasoning: `references/rules/motion-5.md` · https://axiomui.nischal.fyi/rules/motion-5

## Keep UI motion under 300ms (`motion-6`)

Most interface motion should finish quickly. Slow everyday transitions make the product feel heavier than it is.

- Do: Menu: 180ms
- Don't: Menu: 500ms
- Reasoning: `references/rules/motion-6.md` · https://axiomui.nischal.fyi/rules/motion-6

## Asymmetric enter and exit (`motion-7`)

Entrances can be slightly slower for comprehension, but exits should be faster so the interface feels responsive.

- Do: Enter 220ms, exit 160ms
- Don't: Enter 360ms, exit 360ms
- Reasoning: `references/rules/motion-7.md` · https://axiomui.nischal.fyi/rules/motion-7

## Press feedback (`motion-8`)

Pressable controls should respond immediately with a tiny transform so users know the interface heard them.

- Do: button:active scale(0.96)
- Don't: button:active scale(0.90)
- Reasoning: `references/rules/motion-8.md` · https://axiomui.nischal.fyi/rules/motion-8

## Never scale from zero (`motion-9`)

Elements should not appear from scale(0). Start near full size with opacity so the object feels physically present. Small icons (24px or less) are the exception: they can start as low as scale(0.25).

- Do: scale(0.95) + opacity 0
- Don't: scale(0) + opacity 0
- Reasoning: `references/rules/motion-9.md` · https://axiomui.nischal.fyi/rules/motion-9

## Origin-aware popovers (`motion-10`)

Popovers should scale from their trigger. Center origin is correct for modals, but anchored UI should respect its source.

- Do: transform-origin: the trigger
- Don't: transform-origin: center
- Reasoning: `references/rules/motion-10.md` · https://axiomui.nischal.fyi/rules/motion-10

## Subsequent tooltips are instant (`motion-11`)

The first tooltip can wait to avoid accidents. Once a tooltip is open, adjacent tooltips should appear immediately.

- Do: First tooltip 300ms, then 0ms
- Don't: Every tooltip 300ms
- Reasoning: `references/rules/motion-11.md` · https://axiomui.nischal.fyi/rules/motion-11

## Use transitions for interruptible UI (`motion-12`)

CSS transitions can retarget mid-flight. Keyframes restart from the beginning and feel worse under rapid interaction.

- Do: transition: transform 420ms
- Don't: animation: turn 420ms
- Reasoning: `references/rules/motion-12.md` · https://axiomui.nischal.fyi/rules/motion-12

## Use starting styles for entry (`motion-13`)

Animate new elements from their starting visual state instead of mounting them and then forcing a JavaScript state flip.

- Do: @starting-style { opacity: 0 }
- Don't: useEffect(() => setShown(true))
- Reasoning: `references/rules/motion-13.md` · https://axiomui.nischal.fyi/rules/motion-13

## Animate transform and opacity (`motion-14`)

Transform and opacity avoid layout work and stay smooth under load. Avoid animating size, position, padding, or margins.

- Do: translateY + opacity
- Don't: height + top
- Reasoning: `references/rules/motion-14.md` · https://axiomui.nischal.fyi/rules/motion-14

## Use percentage transforms (`motion-15`)

Translate percentages are based on the element's own size, which makes drawers and toasts adapt to content.

- Do: translateY(150%)
- Don't: translateY(40px)
- Reasoning: `references/rules/motion-15.md` · https://axiomui.nischal.fyi/rules/motion-15

## Gate hover motion (`motion-16`)

Hover motion should only run on devices that actually hover. Touch devices can trigger hover states accidentally.

- Do: @media (hover: hover)
- Don't: Hover scale on touch
- Reasoning: `references/rules/motion-16.md` · https://axiomui.nischal.fyi/rules/motion-16

## Reduced motion still has intent (`motion-17`)

Reduced motion should remove movement while preserving helpful feedback through opacity, color, or immediate state changes.

- Do: Reduced motion: fade in place
- Don't: Reduced motion: slides anyway
- Reasoning: `references/rules/motion-17.md` · https://axiomui.nischal.fyi/rules/motion-17

## Gesture dismissal uses velocity (`motion-18`)

Gestures should respect intent, not only distance. A quick flick should dismiss even if it does not cross a large threshold.

- Do: Dismiss on distance or velocity
- Don't: Distance-only swipe threshold
- Reasoning: `references/rules/motion-18.md` · https://axiomui.nischal.fyi/rules/motion-18

## Damp drag boundaries (`motion-19`)

When users drag past a natural boundary, apply damping or friction instead of a hard stop so the interaction feels physical.

- Do: Increasing friction past edge
- Don't: Invisible wall stop
- Reasoning: `references/rules/motion-19.md` · https://axiomui.nischal.fyi/rules/motion-19

## Capture pointer during drag (`motion-20`)

Once dragging starts, capture pointer events and ignore extra touches so the element does not jump or drop mid-gesture.

- Do: setPointerCapture on drag start
- Don't: No pointer capture on drag start
- Reasoning: `references/rules/motion-20.md` · https://axiomui.nischal.fyi/rules/motion-20

## Use CSS under load (`motion-21`)

Predetermined UI animations should use CSS when possible because they keep running while JavaScript is busy.

- Do: Tab indicator: CSS transition
- Don't: Tab indicator: rAF + style writes
- Reasoning: `references/rules/motion-21.md` · https://axiomui.nischal.fyi/rules/motion-21

## Use WAAPI for programmatic motion (`motion-22`)

When animation needs JavaScript control, the Web Animations API gives runtime control while preserving CSS-level performance.

- Do: element.animate transform/opacity
- Don't: setInterval layout animation
- Reasoning: `references/rules/motion-22.md` · https://axiomui.nischal.fyi/rules/motion-22

## Avoid inheritable motion variables (`motion-23`)

Updating CSS variables on a parent can recalculate styles for every child. For drag distance, update the element transform directly.

- Do: element.style.transform
- Don't: Parent --swipe-amount variable
- Reasoning: `references/rules/motion-23.md` · https://axiomui.nischal.fyi/rules/motion-23

## Stagger without blocking (`motion-24`)

Stagger grouped entrances only when it improves rhythm, and keep delays short so interaction is never blocked.

- Do: 30-80ms between items
- Don't: 220ms between items
- Reasoning: `references/rules/motion-24.md` · https://axiomui.nischal.fyi/rules/motion-24

## Review motion in slow time (`motion-25`)

Slow animations down during review to catch abrupt easing, wrong origins, unsynced properties, and awkward color blends.

- Do: Inspect at 2x-5x duration
- Don't: Judge only at full speed
- Reasoning: `references/rules/motion-25.md` · https://axiomui.nischal.fyi/rules/motion-25

## Split enter animations (`motion-26`)

Do not animate a whole page or panel as one object when its content has separate meaning. Split title, copy, and actions into short staggered groups.

- Do: Title, copy, actions staggered 80-100ms
- Don't: Title, copy, actions in one fade
- Reasoning: `references/rules/motion-26.md` · https://axiomui.nischal.fyi/rules/motion-26

## Subtle exit motion (`motion-27`)

Exits should preserve context without stealing attention. Use shorter timing and a small fixed translate instead of dramatic movement.

- Do: opacity 0 + translateY(-12px) at 150ms
- Don't: translateY(-100%) scale(0.5) at 400ms
- Reasoning: `references/rules/motion-27.md` · https://axiomui.nischal.fyi/rules/motion-27

## Animate contextual icons (`motion-28`)

When icons appear, disappear, or swap state, animate opacity, scale, and blur rather than toggling visibility abruptly.

- Do: scale 0.25 → 1, opacity 0 → 1, blur 4px → 0
- Don't: display: none to display: block
- Reasoning: `references/rules/motion-28.md` · https://axiomui.nischal.fyi/rules/motion-28

## Skip default load animation (`motion-29`)

Default-state UI should not replay entrance motion on the first render. Save enter animations for intentional changes after the page is interactive.

- Do: AnimatePresence initial={false}
- Don't: AnimatePresence initial={true}
- Reasoning: `references/rules/motion-29.md` · https://axiomui.nischal.fyi/rules/motion-29

## Related rules in other domains

- `sys-13` Transition only what changes (`references/system.md`)
- `sys-14` Use will-change sparingly (`references/system.md`)
