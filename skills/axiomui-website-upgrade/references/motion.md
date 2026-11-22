# Motion & interaction

Compact Do/Don’t for every rule in this domain. Each Reasoning line names the file with the full write-up.

## Shorten entrances for frequent actions (`motion-1`)

Open the command palette several times in a row. If you keep waiting for its entrance, shorten it or remove it.

- Do: Rare modal: 220ms
- Don’t: Frequent palette: 220ms per open
- Reasoning: `references/rules/motion-1.md` · https://axiomui.nischal.fyi/rules/motion-1

## Focus the palette field on open (`motion-2`)

When a shortcut opens a command palette, focus its field immediately so people can type while it opens.

- Do: Focus on open. First keystrokes land.
- Don’t: Focus after entrance. First keystrokes are lost.
- Reasoning: `references/rules/motion-2.md` · https://axiomui.nischal.fyi/rules/motion-2

## Use motion to show what changed (`motion-3`)

Use motion to show where a panel came from or which action succeeded. Save a bounce for a change worth drawing attention to.

- Do: Details panel slides in from the right
- Don’t: Dialog grows past its final size
- Reasoning: `references/rules/motion-3.md` · https://axiomui.nischal.fyi/rules/motion-3

## Ease out when a panel needs to settle early (`motion-4`)

A strong ease-out covers most of the distance early. Use it when people need to read a panel as it opens.

- Do: cubic-bezier(0.23, 1, 0.32, 1)
- Don’t: ease — cubic-bezier(0.25, 0.1, 0.25, 1)
- Reasoning: `references/rules/motion-4.md` · https://axiomui.nischal.fyi/rules/motion-4

## Match duration to travel distance (`motion-6`)

Start with 180ms for a small menu and watch it open at normal speed. A panel that travels farther may need more time to follow.

- Do: Menu: 180ms
- Don’t: Menu: 500ms
- Reasoning: `references/rules/motion-6.md` · https://axiomui.nischal.fyi/rules/motion-6

## Tune entrance and exit separately (`motion-7`)

Give people time to notice a toast as it enters. Once they dismiss it, a short exit lets them move on.

- Do: Enter 220ms, exit 160ms
- Don’t: Enter 360ms, exit 360ms
- Reasoning: `references/rules/motion-7.md` · https://axiomui.nischal.fyi/rules/motion-7

## Show when a control is pressed (`motion-8`)

Give a press an immediate visible state. A slight scale, fill or border change can work. Keep the control legible and preserve its hit area.

- Do: Pressed button face · scale(0.96)
- Don’t: Pressed button face · scale(0.90)
- Reasoning: `references/rules/motion-8.md` · https://axiomui.nischal.fyi/rules/motion-8

## Start panels near full size (`motion-9`)

Start menus and panels close to full size so their labels stay readable. A small scale change or a fade can mark the entrance.

- Do: scale(0.95) + opacity 0
- Don’t: scale(0) + opacity 0
- Reasoning: `references/rules/motion-9.md` · https://axiomui.nischal.fyi/rules/motion-9

## Anchor a popover’s motion to its trigger (`motion-10`)

When a popover scales in, set its transform origin at the edge nearest its button. If it flips to the other side to fit, move the origin with it.

- Do: transform-origin: top left
- Don’t: transform-origin: center
- Reasoning: `references/rules/motion-10.md` · https://axiomui.nischal.fyi/rules/motion-10

## Delay only the first hover tooltip in a toolbar (`motion-11`)

Wait 300ms before opening the first tooltip on hover. Then show neighboring tooltips immediately. Restore the delay after the pointer has been away for 300ms.

- Do: Hover delay · 300ms first, then 0ms
- Don’t: Hover delay · 300ms on every tool
- Reasoning: `references/rules/motion-11.md` · https://axiomui.nischal.fyi/rules/motion-11

## Reverse motion from its current position (`motion-12`)

If a control reverses mid-animation, turn it back from where it is. A CSS transition does this automatically. With keyframes, reverse the running animation to avoid a jump.

- Do: transition: transform 420ms
- Don’t: Restart from a fixed endpoint (420ms)
- Reasoning: `references/rules/motion-12.md` · https://axiomui.nischal.fyi/rules/motion-12

## Give new elements a starting style (`motion-13`)

Use @starting-style for a CSS transition on newly rendered content. Leave the normal style visible so the content remains usable if the entry animation is skipped.

- Do: .row { @starting-style { opacity: 0 } }
- Don’t: Row appears immediately on insertion
- Reasoning: `references/rules/motion-13.md` · https://axiomui.nischal.fyi/rules/motion-13

## Use a transform when neighbors can stay in place (`motion-14`)

Use a transform to move an element while its neighbors stay put. Use opacity to fade it. If nearby content must move aside, animate the height and check for dropped frames.

- Do: translateY
- Don’t: Animating height for a visual slide
- Reasoning: `references/rules/motion-14.md` · https://axiomui.nischal.fyi/rules/motion-14

## Base slide exits on the element’s height (`motion-15`)

To slide a toast off screen, move it by its own height plus the gap to the clipping edge. A percentage in translateY() scales with the toast’s height.

- Do: translateY(150%)
- Don’t: translateY(40px)
- Reasoning: `references/rules/motion-15.md` · https://axiomui.nischal.fyi/rules/motion-15

## Show hover effects only where hover exists (`motion-16`)

Enable hover-only effects when the primary input can hover. Keep every action available through touch and keyboard, including on devices with several input types.

- Do: @media (hover: hover)
- Don’t: Button scales on tap
- Reasoning: `references/rules/motion-16.md` · https://axiomui.nischal.fyi/rules/motion-16

## Preserve feedback with reduced motion (`motion-17`)

When reduced motion is on, remove unnecessary travel, zoom and spin. Keep the result visible with a label or icon.

- Do: With reduced motion, the toast fades in place
- Don’t: With reduced motion, the toast still slides up
- Reasoning: `references/rules/motion-17.md` · https://axiomui.nischal.fyi/rules/motion-17

## Let a quick flick dismiss a card (`motion-18`)

For a swipe dismissal people can undo, accept a short, fast flick as well as a long drag. Check the direction and recent speed when they release.

- Do: Dismiss on a long drag or a fast flick toward the edge
- Don’t: Dismiss on a long drag only
- Reasoning: `references/rules/motion-18.md` · https://axiomui.nischal.fyi/rules/motion-18

## Add resistance past a drag limit (`motion-19`)

When a card reaches its drag limit, let it move less with each extra pixel of pull. On release, return it to rest. Leave native scroll bounce alone and keep sliders within their valid range.

- Do: Past the limit, the card moves less with each extra pixel of pull
- Don’t: Card stops abruptly at the limit
- Reasoning: `references/rules/motion-19.md` · https://axiomui.nischal.fyi/rules/motion-19

## Keep tracking the pointer that started the drag (`motion-20`)

Capture the pointer that starts the drag so it keeps working outside the handle. End the drag when that pointer is released or the gesture is canceled.

- Do: Tracks outside the frame until release or cancel
- Don’t: Stops tracking outside the frame
- Reasoning: `references/rules/motion-20.md` · https://axiomui.nischal.fyi/rules/motion-20

## Keep decorative motion independent of busy scripts (`motion-21`)

For a move between two fixed positions, use a CSS transform transition. If the browser runs it on the compositor, it can keep moving while a long JavaScript task blocks frame callbacks.

- Do: CSS transform transition
- Don’t: JavaScript updates the transform every frame
- Reasoning: `references/rules/motion-21.md` · https://axiomui.nischal.fyi/rules/motion-21

## Cap the total stagger time (`motion-24`)

Stagger rows when their order helps people follow a change. Check when the last row finishes. As the list grows, shorten the delay or show the rows together.

- Do: Three rows start 60ms apart
- Don’t: Three rows start 220ms apart
- Reasoning: `references/rules/motion-24.md` · https://axiomui.nischal.fyi/rules/motion-24

## Make icon state changes recognizable (`motion-28`)

When an icon changes, keep the new icon recognizable as it appears and at rest. Swap it instantly or crossfade without blur.

- Do: New icon stays sharp as it appears
- Don’t: Blur hides the new icon’s shape
- Reasoning: `references/rules/motion-28.md` · https://axiomui.nischal.fyi/rules/motion-28

## Show ready controls on first paint (`motion-29`)

Render controls that are already available in their usable state. Reserve an entrance for a later change the user needs to notice.

- Do: Ready controls render in place on first paint
- Don’t: Ready controls fade and slide into place on load
- Reasoning: `references/rules/motion-29.md` · https://axiomui.nischal.fyi/rules/motion-29

## Related rules in other domains

- `sys-13` Limit transitions to intended properties (`references/system.md`)
- `a11y-4` Offer a click or tap alternative to dragging (`references/accessibility.md`)
- `a11y-6` Let people pause what moves or updates on its own (`references/accessibility.md`)
