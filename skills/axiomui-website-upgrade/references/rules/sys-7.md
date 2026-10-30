# Show progress for multi-step

- ID: sys-7
- Category: System & logic
- Tags: Guidance, Feedback
- URL: https://axiomui.nischal.fyi/rules/sys-7

If a flow runs three or more steps, show where the user is in it. An unbounded flow gives them no way to decide whether to start now or come back later.

- Do: Step 2 of 4
- Don't: No progress indicator

## Why it works

Without a denominator a flow has no visible end, so every screen could be the second of five or the second of twenty. Step 2 of 4 supplies that denominator, and the goal-gradient effect takes it from there: effort rises as the remaining distance shrinks, which is why abandonment concentrates in the early steps of flows that feel unbounded.

## What breaks

A five-screen onboarding with no counter loses people at screen two, because from inside screen two there is no way to tell whether three more are coming or thirteen.

## How to apply it

1. Show a Step 2 of 4 counter on any flow of three or more steps.
2. Fix the total up front and never let it grow mid-flow; a moving denominator is worse than none.
3. Let users step back into completed steps, and keep their entries when they do.
4. Skip the counter below three steps, where it costs more attention than it returns.

## Review questions

1. Does a flow with three or more steps show a current step and total count?
2. Does the total number of steps stay fixed as the user progresses?
3. Can the user tell how much is left at every point in the flow?
