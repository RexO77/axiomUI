# Keep a drag attached to its initiating pointer

- ID: motion-20
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-20

For an element-local drag, capture the initiating pointer and track its ID. Clean up on release, cancellation and loss of capture.

- Do: setPointerCapture on drag start
- Don't: No pointer capture on drag start

## Why it works

Pointer capture retargets events for a particular active pointer to the capture element. A mouse drag can then continue outside the handle. Direct-manipulation devices may supply implicit capture, so a touch demo alone can conceal a missing capture path.

- [Pointer Events · Pointer capture](https://www.w3.org/TR/pointerevents3/#pointer-capture)
- [WCAG 2.2 · Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

## What breaks

If a second contact overwrites the active pointer or a canceled drag follows the commit path, the handle can jump or submit an unintended change.

## How to apply it

1. Record the active pointerId and capture it when the drag starts.
2. Choose touch-action to preserve the page gestures the control does not own.
3. Handle pointerup, pointercancel and lostpointercapture with idempotent cleanup.
4. For a slider, let a tap on the track set the value as well. Check the keyboard path and the single-pointer path separately.

## Review questions

1. Does a mouse drag continue outside the handle?
2. Can a second finger take over unexpectedly?
3. Can scrolling, cancellation or loss of capture leave the control stuck?
