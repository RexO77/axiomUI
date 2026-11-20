# Show the initial interface in its ready state

- ID: motion-29
- Category: Motion & interaction
- Tags: Entry, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-29

Render controls that are already available in their usable state. Reserve an entrance for a later change the user needs to notice.

- Do: AnimatePresence initial={false}
- Don't: AnimatePresence initial={true}

## Why it works

On refresh, a persistent control has no preceding on-screen position to transition from. Delaying its opacity hides something the application already knows how to render. Content that genuinely arrives later can use an entrance to show what changed.

- [Motion · Initial animations in AnimatePresence](https://motion.dev/docs/react-animate-presence#initial)

## What breaks

On a frequently revisited screen, entrance effects can briefly hide the controls needed to resume work or make a restored focus target difficult to locate.

## How to apply it

1. Render the initial state visibly in the first usable page.
2. With Motion for React, AnimatePresence initial={false} skips initial animations on children present at first render.
3. Test refresh, restored state and a later insertion separately.

## Review questions

1. Which content is known before the first render?
2. Can the user locate the initial focus target immediately?
3. Does the later insertion still communicate a meaningful change?
