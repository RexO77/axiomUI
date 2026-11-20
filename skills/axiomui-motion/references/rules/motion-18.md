# Use release direction and speed for swipe dismissal

- ID: motion-18
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-18

For a reversible swipe dismissal, consider a short, deliberate flick as well as a longer drag. Check the direction and recent speed at release.

- Do: Dismiss on distance or velocity
- Don't: Distance-only swipe threshold

## Why it works

Dragging slowly past a visible threshold gives a person spatial feedback. A fast flick in the dismissal direction can express the same intent with less travel. An old velocity sample can misread a drag that moved quickly, paused and then released.

- [Flutter · Swipe dismissal thresholds](https://api.flutter.dev/flutter/widgets/Dismissible/dismissThresholds.html)
- [WCAG 2.2 · Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [WCAG 2.2 · Pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)

## What breaks

High sensitivity can dismiss an item during scrolling or a small correction. If the gesture is the only way to dismiss, people who cannot drag have no equivalent action.

## How to apply it

1. Measure recent movement along the dismissal axis and settle on release.
2. Test a quick flick, slow drag, reversal and flick followed by a pause.
3. Offer an ordinary dismiss control and a way to recover where loss matters.

## Review questions

1. Does a stationary release below the distance threshold keep the card?
2. Does a canceled pointer leave the item intact?
3. Can someone complete the same action with a single tap or click?
