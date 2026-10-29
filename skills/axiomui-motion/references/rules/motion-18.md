# Gesture dismissal uses velocity

- ID: motion-18
- Category: Motion & interaction
- Tags: Gestures, Touch
- URL: https://axiomui.nischal.fyi/rules/motion-18

Gestures should respect intent, not only distance. A quick flick should dismiss even if it does not cross a large threshold.

- Do: Dismiss on distance or velocity
- Don't: Distance-only swipe threshold

## Why it works

Physical gestures carry momentum, and a fast flick expresses as much intent as a slow drag that covers more pixels. Judging dismissal purely on distance ignores velocity, the same physics principle behind momentum scrolling, so a quick short flick should still cross the dismiss threshold. Combining distance OR velocity checks respects how users actually flick cards and sheets away.

## What breaks

A user flicks a card quickly but only a short distance, the gesture snaps back because it did not clear the distance threshold, and the interaction feels unresponsive or broken.

## How to apply it

1. Dismiss when either distance or velocity crosses its threshold, not distance alone.
2. Read pointer velocity from the gesture library’s velocity output on release.
3. Set a velocity threshold that catches quick short flicks a static swipe distance would miss.
4. Test with deliberately short, fast flicks in addition to slow full-distance drags.

## Review questions

1. Does a quick short flick dismiss the element even without reaching full distance?
2. Does a slow drag still dismiss once it crosses the distance threshold?
3. Does an accidental slow small nudge correctly snap back instead of dismissing?
