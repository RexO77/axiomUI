---
name: axiomui-motion
description: Use Axiom UI’s motion guidance when deciding whether to animate, choosing easing or timing, coordinating entrance and exit, anchoring popovers, handling tooltip delays, redirecting interrupted motion, supporting drag and swipe, reducing motion, or diagnosing dropped frames. It covers CSS transitions, starting styles, the Web Animations API, property selection and will-change.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Motion & interaction

Choose a transition for a specific change of state and try it at the speed someone would actually use the control. A repeated shortcut can keep its content ready immediately. A panel can use motion to explain where it came from. Use the example timings to compare treatments, then test interruption, reduced motion and actual frame delivery.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test the failure the comparison illustrates. For a standard, verify the applicable requirement and its exceptions. For a design convention, judge the outcome with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Animate by frequency (`motion-1`)

Watch a frequent action several times in succession. Shorten its entrance when it gets between the user and the next input.

- Do: Rare modal: 220ms
- Don't: Frequent palette: 220ms
- Reasoning: `references/rules/motion-1.md` · https://axiomui.nischal.fyi/rules/motion-1

### Keep keyboard input responsive (`motion-2`)

When a shortcut opens a command palette, move focus into the field and accept the next keystroke while the panel settles.

- Do: Keyboard panel: 0ms
- Don't: Keyboard panel: 240ms
- Reasoning: `references/rules/motion-2.md` · https://axiomui.nischal.fyi/rules/motion-2

### Purpose before motion (`motion-3`)

Use movement to show where a panel came from, what changed, or which action succeeded. Keep occasional expressive moments proportionate to their importance.

- Do: Drawer slides from its edge
- Don't: Modal bounces in
- Reasoning: `references/rules/motion-3.md` · https://axiomui.nischal.fyi/rules/motion-3

### Choose easing for the movement (`motion-4`)

For an entrance, compare how much ground each curve covers before the content needs to be read. Use a stronger ease-out when the panel should reach its resting position early.

- Do: cubic-bezier(0.23, 1, 0.32, 1)
- Don't: ease — cubic-bezier(0.25, 0.1, 0.25, 1)
- Reasoning: `references/rules/motion-4.md` · https://axiomui.nischal.fyi/rules/motion-4

### Make the start of an entrance visible (`motion-5`)

When movement is the first sign that a menu opened, choose a curve that makes early progress visible. An accelerating exit can suit a panel leaving the screen.

- Do: Menu open: ease-out
- Don't: Menu open: ease-in
- Reasoning: `references/rules/motion-5.md` · https://axiomui.nischal.fyi/rules/motion-5

### Time motion to the task (`motion-6`)

Use short transitions for nearby controls. Start with 180ms for a small menu and compare it at normal speed. Larger changes in position or context can need longer.

- Do: Menu: 180ms
- Don't: Menu: 500ms
- Reasoning: `references/rules/motion-6.md` · https://axiomui.nischal.fyi/rules/motion-6

### Tune entrance and exit separately (`motion-7`)

A toast can arrive slowly enough to locate and leave quickly once dismissed. Choose each direction’s timing for what the user needs to follow.

- Do: Enter 220ms, exit 160ms
- Don't: Enter 360ms, exit 360ms
- Reasoning: `references/rules/motion-7.md` · https://axiomui.nischal.fyi/rules/motion-7

### Show when a control is pressed (`motion-8`)

Give a press an immediate visible state. A slight scale, fill or border change can work. Keep the control legible and preserve its hit area.

- Do: button:active scale(0.96)
- Don't: button:active scale(0.90)
- Reasoning: `references/rules/motion-8.md` · https://axiomui.nischal.fyi/rules/motion-8

### Keep surface entrances near full size (`motion-9`)

When a panel contains text or controls, begin near its reading size. Use a small scale change or fade if the entrance needs emphasis.

- Do: scale(0.95) + opacity 0
- Don't: scale(0) + opacity 0
- Reasoning: `references/rules/motion-9.md` · https://axiomui.nischal.fyi/rules/motion-9

### Anchor a popover’s motion to its trigger (`motion-10`)

If an anchored popover scales, put the transform origin on the edge facing the trigger. Recompute it after a collision changes placement.

- Do: transform-origin: the trigger
- Don't: transform-origin: center
- Reasoning: `references/rules/motion-10.md` · https://axiomui.nischal.fyi/rules/motion-10

### Share tooltip timing across a toolbar (`motion-11`)

Delay the first hover tooltip while a pointer crosses the toolbar. Once it opens, reveal adjacent tips without another wait. Reset after the pointer leaves the group.

- Do: First tooltip 300ms, then 0ms
- Don't: Every tooltip 300ms
- Reasoning: `references/rules/motion-11.md` · https://axiomui.nischal.fyi/rules/motion-11

### Retarget interrupted motion from its current position (`motion-12`)

When a control reverses mid-transition, continue from its visible position. A CSS transition handles ordinary state changes. A controlled keyframe animation can reverse too.

- Do: transition: transform 420ms
- Don't: animation: turn 420ms
- Reasoning: `references/rules/motion-12.md` · https://axiomui.nischal.fyi/rules/motion-12

### Give new elements a starting style (`motion-13`)

Use @starting-style for a CSS transition on newly rendered content. Leave the normal style visible so the content remains usable if the entry animation is skipped.

- Do: .row { @starting-style { opacity: 0 } }
- Don't: useEffect(() => setShown(true))
- Reasoning: `references/rules/motion-13.md` · https://axiomui.nischal.fyi/rules/motion-13

### Choose animation properties with layout in mind (`motion-14`)

Use transform and opacity when content can move without rearranging its neighbors. If space must open in the layout, measure the cost of animating the real geometry.

- Do: translateY + opacity
- Don't: height
- Reasoning: `references/rules/motion-14.md` · https://axiomui.nischal.fyi/rules/motion-14

### Size slide exits to the moving element (`motion-15`)

For variable-height content, express vertical travel against the element’s transform reference box. Include any gap to the clipping edge in the exit distance.

- Do: translateY(150%)
- Don't: translateY(40px)
- Reasoning: `references/rules/motion-15.md` · https://axiomui.nischal.fyi/rules/motion-15

### Gate decorative hover motion (`motion-16`)

Enable hover-only effects when the primary input can hover. Keep every action available through touch and keyboard, including on devices with several input types.

- Do: @media (hover: hover)
- Don't: Hover scale on touch
- Reasoning: `references/rules/motion-16.md` · https://axiomui.nischal.fyi/rules/motion-16

### Preserve feedback with reduced motion (`motion-17`)

Honor reduced motion by removing unnecessary travel, zoom and spin. Show the resulting state through a stable label, icon or other persistent cue.

- Do: Reduced motion: fade in place
- Don't: Reduced motion: slides anyway
- Reasoning: `references/rules/motion-17.md` · https://axiomui.nischal.fyi/rules/motion-17

### Use release direction and speed for swipe dismissal (`motion-18`)

For a reversible swipe dismissal, consider a short, deliberate flick as well as a longer drag. Check the direction and recent speed at release.

- Do: Dismiss on distance or velocity
- Don't: Distance-only swipe threshold
- Reasoning: `references/rules/motion-18.md` · https://axiomui.nischal.fyi/rules/motion-18

### Use drag resistance where overshoot is meaningful (`motion-19`)

An elastic edge can show that a surface has reached its limit while the finger continues moving. Clamp controls that represent a fixed valid range.

- Do: Increasing friction past edge
- Don't: Invisible wall stop
- Reasoning: `references/rules/motion-19.md` · https://axiomui.nischal.fyi/rules/motion-19

### Keep a drag attached to its initiating pointer (`motion-20`)

For an element-local drag, capture the initiating pointer and track its ID. Clean up on release, cancellation and loss of capture.

- Do: setPointerCapture on drag start
- Don't: No pointer capture on drag start
- Reasoning: `references/rules/motion-20.md` · https://axiomui.nischal.fyi/rules/motion-20

### Keep decorative motion independent of busy scripts (`motion-21`)

For fixed movement between two states, try a CSS transform transition. Once a browser can composite it, a busy main thread can delay script callbacks while the visual transition continues.

- Do: Tab indicator: CSS transition
- Don't: Tab indicator: rAF + style writes
- Reasoning: `references/rules/motion-21.md` · https://axiomui.nischal.fyi/rules/motion-21

### Use a playback controller for programmatic animation (`motion-22`)

Use element.animate() when code needs to start, pause or reverse a known sequence. Let the browser interpolate between keyframes.

- Do: element.animate() on transform
- Don't: setInterval transform every 80ms
- Reasoning: `references/rules/motion-22.md` · https://axiomui.nischal.fyi/rules/motion-22

### Scope rapidly changing drag styles (`motion-23`)

Update a drag value near the element that consumes it. If a changing custom property is inherited from a large ancestor, measure how much style work reaches its descendants.

- Do: element.style.transform
- Don't: Parent --swipe-amount variable
- Reasoning: `references/rules/motion-23.md` · https://axiomui.nischal.fyi/rules/motion-23

### Limit the total stagger (`motion-24`)

When a short sequence helps people follow a group of arrivals, budget for the last useful item. Cap or remove delays as the group grows.

- Do: 60ms between three row starts
- Don't: 220ms between items
- Reasoning: `references/rules/motion-24.md` · https://axiomui.nischal.fyi/rules/motion-24

### Review motion slowly, then at normal speed (`motion-25`)

Slow playback to inspect a transition frame by frame. Return to normal speed to judge whether it suits the task.

- Do: Inspect at 2x-5x duration
- Don't: Judge only at full speed
- Reasoning: `references/rules/motion-25.md` · https://axiomui.nischal.fyi/rules/motion-25

### Sequence panel content when order explains something (`motion-26`)

Reveal related groups in sequence when the order helps explain a change. Present a routine dialog together when people need to read and act immediately.

- Do: Title, copy, actions staggered 90ms
- Don't: Title, copy, actions in one fade
- Reasoning: `references/rules/motion-26.md` · https://axiomui.nischal.fyi/rules/motion-26

### Keep routine exits quiet (`motion-27`)

Use a short fade or small movement when a dismissed item has no destination to explain. A longer directional exit can help when the item returns to a known place.

- Do: opacity 0 + translateY(-12px) at 150ms
- Don't: translateY(-100%) scale(0.5) at 400ms
- Reasoning: `references/rules/motion-27.md` · https://axiomui.nischal.fyi/rules/motion-27

### Make icon state changes recognizable (`motion-28`)

When an icon changes meaning, keep the result recognizable at rest. A short crossfade can help connect the two shapes. Use scale or blur only when the small glyph remains legible.

- Do: scale 0.25 → 1, opacity 0 → 1, blur 4px → 0
- Don't: display: none to display: block
- Reasoning: `references/rules/motion-28.md` · https://axiomui.nischal.fyi/rules/motion-28

### Show the initial interface in its ready state (`motion-29`)

Render controls that are already available in their usable state. Reserve an entrance for a later change the user needs to notice.

- Do: AnimatePresence initial={false}
- Don't: AnimatePresence initial={true}
- Reasoning: `references/rules/motion-29.md` · https://axiomui.nischal.fyi/rules/motion-29

## Cross-listed from other domains

These system rules cover property selection and resource hints when implementing motion in CSS.

### Limit transitions to intended properties (`sys-13`)

List the properties that should animate in a state change. A broad transition can also animate unrelated changes in computed style.

- From: System & logic
- Do: transition-property: scale, background-color
- Don't: transition: all 150ms ease-out
- Reasoning: `references/rules/sys-13.md` · https://axiomui.nischal.fyi/rules/sys-13

### Use will-change sparingly (`sys-14`)

Use will-change only when profiling shows that advance preparation helps a particular element. Name the expected property and release the hint when the need passes.

- From: System & logic
- Do: will-change: transform, opacity on one measured card
- Don't: will-change: transform, opacity on every card
- Reasoning: `references/rules/sys-14.md` · https://axiomui.nischal.fyi/rules/sys-14

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
