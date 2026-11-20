# Animate by frequency

- ID: motion-1
- Category: Motion & interaction
- Tags: Perceived performance, Intent
- URL: https://axiomui.nischal.fyi/rules/motion-1

Watch a frequent action several times in succession. Shorten its entrance when it gets between the user and the next input.

- Do: Rare modal: 220ms
- Don't: Frequent palette: 220ms

## Why it works

A command palette has a useful test: open it and type the first letter in one motion. A palette can still be settling when the query arrives. If the field already has focus and the first result is readable, the entrance costs less than one that hides the result or defers input.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)
- [web.dev · Interaction latency and presentation delay](https://web.dev/articles/optimize-inp)

## What breaks

If the first keystroke lands in the page behind the palette, shortening the fade alone leaves the interaction broken.

## How to apply it

1. Identify a repeated task and the next input it invites.
2. Make its destination ready as soon as the action succeeds.
3. Compare an immediate entrance with the current one over a sequence of realistic tasks.

## Review questions

1. Where does the first keystroke land?
2. Does anything move under the pointer as the user reaches for the next action?
3. What does the entrance explain on the tenth open?
