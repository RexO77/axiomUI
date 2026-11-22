# Match duration to travel distance

- ID: motion-6
- Category: Motion & interaction
- Tags: Timing, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-6

Start with 180ms for a small menu and watch it open at normal speed. A panel that travels farther may need more time to follow.

- Do: Menu: 180ms
- Don’t: Menu: 500ms

## Why it works

A menu opened beside its trigger has little ground to cover. Stretching the same motion from 180ms to 500ms leaves its labels moving for longer. A large change of view may need more time to show the relationship between the starting and ending positions.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)
- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion)
- [NN/g · Executing UX animations](https://www.nngroup.com/articles/animation-duration/)
- [Microsoft Fluent · Motion](https://fluent2.microsoft.design/motion)
- [Chrome DevTools · Inspecting animations](https://developer.chrome.com/docs/devtools/css/animations)

## What breaks

A fixed duration applied across a product can make a small menu linger and a full-width panel rush across the screen.

## How to apply it

1. Group motion tokens by role and travel distance.
2. Test the smallest and largest instances of the component.
3. Measure when content becomes usable and when it comes to rest. Slow playback to find a flash or jump, then replay at normal speed to judge the timing.

## Before you ship

1. Can a user select an item while the menu opens?
2. Is the destination easy to follow on a wide screen?
3. Does the transition still help after several uses?
