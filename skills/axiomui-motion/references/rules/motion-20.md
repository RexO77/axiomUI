# Keep tracking the pointer that started the drag

- ID: motion-20
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-20

Capture the pointer that starts the drag so it keeps working outside the handle. End the drag when that pointer is released or the gesture is canceled.

- Do: Tracks outside the frame until release or cancel
- Don’t: Stops tracking outside the frame

## Why it works

Pointer capture keeps sending the drag element events from the pointer that started the drag, even outside the handle. Touch input can capture a pointer automatically, so also test with a mouse.

- [Pointer Events · Pointer capture](https://www.w3.org/TR/pointerevents3/#pointer-capture)
- [Pointer Events · The touch-action property](https://www.w3.org/TR/pointerevents3/#the-touch-action-css-property)
- [WCAG 2.2 · Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [WCAG 2.2 · Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)

## What breaks

If a second contact overwrites the active pointer or a canceled drag follows the commit path, the handle can jump or submit an unintended change.

## How to apply it

1. Record the active pointerId and call setPointerCapture(pointerId) on the drag element when the drag starts.
2. Choose touch-action for the gestures the page still needs. On a horizontal drag surface, pan-y preserves vertical scrolling.
3. Clean up on pointerup, pointercancel and lostpointercapture. Make cleanup safe to run twice. If release triggers an action, skip it on cancellation.
4. For a slider, let a tap on the track set the value as well. Check the keyboard path and the single-pointer path separately.

## Before you ship

1. Does a mouse drag continue outside the handle?
2. Can a second finger take over unexpectedly?
3. Can scrolling, cancellation or loss of capture leave the control stuck?
