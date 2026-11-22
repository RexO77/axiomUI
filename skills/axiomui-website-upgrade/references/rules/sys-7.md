# Show the current step in a multi-step flow

- ID: sys-7
- Category: System & logic
- Tags: Guidance, Feedback
- URL: https://axiomui.nischal.fyi/rules/sys-7

For a fixed sequence, show the current step and how many remain. If answers can add or skip steps, show the step names without a fixed total.

- Do: Step 2 of 4
- Don’t: No progress indicator

## Why it works

“Step 2 of 4” tells someone at Shipping how much checkout remains. In an application, adding a dependent might add another section. Show stage names until the total is known.

- [USWDS · Step indicators](https://designsystem.digital.gov/components/step-indicator/)
- [GOV.UK · Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- [W3C WAI · Multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/)
- [Baymard · Progress indicators for UI/UX](https://baymard.com/blog/progress-indicator-ui-ux)

## What breaks

A progress bar that moves backward after a new section appears can make completing an answer feel like losing progress. Counting every field as a step can also exaggerate the remaining effort.

## How to apply it

1. Name the stages people recognize, such as Shipping, Payment and Review.
2. Show a reliable total only when the route is known.
3. Preserve completed answers when users review or return to an earlier stage.

## Before you ship

1. Can the person identify the current task?
2. Does the stated total remain accurate on each branch?
3. Can they review an earlier answer without losing later work?
