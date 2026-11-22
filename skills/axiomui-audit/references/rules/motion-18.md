# Let a quick flick dismiss a card

- ID: motion-18
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-18

For a swipe dismissal people can undo, accept a short, fast flick as well as a long drag. Check the direction and recent speed when they release.

- Do: Dismiss on a long drag or a fast flick toward the edge
- Don’t: Dismiss on a long drag only

## Why it works

A slow drag past the 60% line and a short flick faster than 0.5 px/ms toward the edge both dismiss the card. Measure speed just before release so a drag that ends in a pause doesn’t count as a flick.

- [Flutter · Swipe dismissal thresholds](https://api.flutter.dev/flutter/widgets/Dismissible/dismissThresholds.html)
- [Flutter · Pointer velocity estimation](https://api.flutter.dev/flutter/gestures/VelocityTracker/getVelocityEstimate.html)
- [Android Developers · Gesture animation](https://developer.android.com/develop/ui/compose/animation/advanced)
- [WCAG 2.2 · Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [WCAG 2.2 · Pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)
- [Radix Primitives · Toast swipe threshold](https://github.com/radix-ui/primitives/blob/6d5838b754ced22597b874aea58e4c28592abbeb/packages/react/toast/src/toast.tsx#L81-L85)

## What breaks

High sensitivity can dismiss an item during scrolling or a small correction. If the gesture is the only way to dismiss, people who cannot drag have no equivalent action.

## How to apply it

1. Measure recent movement along the dismissal axis and settle on release.
2. Test a quick flick, slow drag, reversal and flick followed by a pause.
3. Provide a Dismiss button. If dismissal removes something important, let people undo it.

## Before you ship

1. Does a stationary release below the distance threshold keep the card?
2. Does a canceled pointer leave the item intact?
3. Can someone complete the same action with a single tap or click?
