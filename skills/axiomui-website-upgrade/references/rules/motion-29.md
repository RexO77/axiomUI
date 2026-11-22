# Show ready controls on first paint

- ID: motion-29
- Category: Motion & interaction
- Tags: Entry, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-29

Render controls that are already available in their usable state. Reserve an entrance for a later change the user needs to notice.

- Do: Ready controls render in place on first paint
- Don’t: Ready controls fade and slide into place on load

## Why it works

On refresh, a persistent control has no preceding on-screen position to transition from. Fading it in hides a control the page could already show. Content that genuinely arrives later can use an entrance to show what changed.

- [Emil Kowalski · You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations)
- [Apple HIG · Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- [Motion · Initial animations in AnimatePresence](https://motion.dev/docs/react-animate-presence#initial)
- [WCAG 2.2 · Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [Carbon · Motion choreography](https://www.carbondesignsystem.com/building-blocks/foundations/motion/choreography)

## What breaks

On a frequently revisited screen, entrance effects can briefly hide the controls needed to resume work or make a restored focus target difficult to locate.

## How to apply it

1. Show ready controls at full opacity and in their final position on first paint.
2. With Motion for React, AnimatePresence initial={false} skips initial animations on children present at first render.
3. Test refresh, restored state and a later insertion separately.

## Before you ship

1. Which content is known before the first render?
2. Can the user locate the initial focus target immediately?
3. When a new item appears, can you tell what was added?
