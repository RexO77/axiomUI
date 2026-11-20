# Time motion to the task

- ID: motion-6
- Category: Motion & interaction
- Tags: Timing, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-6

Use short transitions for nearby controls. Start with 180ms for a small menu and compare it at normal speed. Larger changes in position or context can need longer.

- Do: Menu: 180ms
- Don't: Menu: 500ms

## Why it works

A menu opened beside its trigger has little ground to cover. Stretching the same motion from 180ms to 500ms leaves its labels moving for longer. A large change of view may need more time to show the relationship between the starting and ending positions.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)

## What breaks

A fixed duration applied across a product can make a small menu linger and a full-width panel rush across the screen.

## How to apply it

1. Group motion tokens by role and travel distance.
2. Test the smallest and largest instances of the component.
3. Measure when content is usable separately from when it comes to rest.

## Review questions

1. Can a user select an item while the menu opens?
2. Is the destination easy to follow on a wide screen?
3. Does the transition still help after several uses?
