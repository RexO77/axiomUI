# Orient people in a multi-step flow

- ID: sys-7
- Category: System & logic
- Tags: Guidance, Feedback
- URL: https://axiomui.nischal.fyi/rules/sys-7

For a long, predictable sequence, show the current stage and the work ahead. Use stage names without a fixed total when answers can change which steps appear.

- Do: Step 2 of 4
- Don't: No progress indicator

## Why it works

“Step 2 of 4” is useful in a fixed sequence because the denominator is credible. In a branching application the same answer could add dependents, documents or eligibility questions, making a confident total misleading.

- [USWDS · Step indicators](https://designsystem.digital.gov/components/step-indicator/)

## What breaks

A progress bar that moves backward after a new section appears can make completing an answer feel like losing progress. Counting every field as a step can also exaggerate the remaining effort.

## How to apply it

1. Use the terms people recognize for major stages.
2. Show a reliable total only when the route is known.
3. Preserve completed answers when users review or return to an earlier stage.

## Review questions

1. Can the person identify the current task?
2. Does the stated total remain accurate on each branch?
3. Can they review an earlier answer without losing later work?
