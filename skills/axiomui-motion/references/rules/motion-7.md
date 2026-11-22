# Tune entrance and exit separately

- ID: motion-7
- Category: Motion & interaction
- Tags: Timing, Exit, Entry
- URL: https://axiomui.nischal.fyi/rules/motion-7

Give people time to notice a toast as it enters. Once they dismiss it, a short exit lets them move on.

- Do: Enter 220ms, exit 160ms
- Don’t: Enter 360ms, exit 360ms

## Why it works

A toast introduces information on entry, but by dismissal the next task may already be underway. The example gives entry 220ms and exit 160ms. A drawer returning to its edge or a card moving into an archive may need more time and travel to show where it went.

- [Atlassian Design · Applying motion](https://atlassian.design/foundations/motion/applying-motion)
- [NN/g · Executing UX animations](https://www.nngroup.com/articles/animation-duration/)
- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI-ARIA APG · Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

## What breaks

An exit can block the next click if its invisible layer still intercepts input. An exit that is too brief can hide where the object went.

## How to apply it

1. Keep the toast visible long enough to read. When someone dismisses it, use a short fade or slide.
2. Keep focus where it is when a passive toast appears or disappears. If someone dismisses it with a focused button inside the toast, move focus to the next control for their task.
3. Dismiss the toast mid-entrance. Does it leave from its current position?

## Before you ship

1. Can the message be read before it goes away?
2. Where does the next click or keystroke go?
3. Does the destination of a moving item remain clear?
