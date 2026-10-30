# Capture pointer during drag

- ID: motion-20
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-20

Once dragging starts, capture pointer events and ignore extra touches so the element does not jump or drop mid-gesture.

- Do: setPointerCapture on drag start
- Don't: No pointer capture on drag start

## Why it works

Once a drag starts, the element should keep tracking that one pointer even if it strays outside the element’s bounds or a second finger touches down. setPointerCapture on drag start redirects all subsequent pointer events to the dragged element regardless of what is under the cursor, which is exactly the pointer capture semantics browsers expose for this case. Without it, moving fast enough to leave the element’s hit area silently drops the gesture.

## What breaks

A user drags quickly and their pointer slips outside the element’s bounding box mid-gesture, the drag handler stops receiving events, and the element abruptly freezes or drops.

## How to apply it

1. Call setPointerCapture on the drag target inside the pointerdown handler.
2. Release capture explicitly on pointerup or pointercancel.
3. Ignore additional pointer IDs that arrive while a capture is active.
4. Verify the element keeps tracking the pointer even when dragged outside its own bounds.

## Review questions

1. Does the drag keep following the pointer even when it moves outside the element’s edges?
2. Does introducing a second touch during a drag leave the first drag unaffected?
3. Does releasing the pointer cleanly end the drag without a stuck or jumping element?
