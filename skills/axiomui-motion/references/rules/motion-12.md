# Reverse motion from its current position

- ID: motion-12
- Category: Motion & interaction
- Tags: Animation API, CSS
- URL: https://axiomui.nischal.fyi/rules/motion-12

If a control reverses mid-animation, turn it back from where it is. A CSS transition does this automatically. With keyframes, reverse the running animation to avoid a jump.

- Do: transition: transform 420ms
- Don’t: Restart from a fixed endpoint (420ms)

## Why it works

Select Move cards twice before the cards finish moving. The CSS transition turns back from its current position. Restarting keyframes from a fixed endpoint makes the card jump. With the Web Animations API, keep the Animation object and call reverse() on it.

- [CSS Transitions · Reversing an interrupted transition](https://www.w3.org/TR/css-transitions-1/#reversing)
- [W3C · Web Animations timing and playback](https://www.w3.org/TR/web-animations-1/)
- [web.dev · Web Animations API improvements](https://web.dev/blog/web-animations)

## What breaks

An interrupted toggle can jump ahead to a state it never visibly reached, then move back toward the requested one.

## How to apply it

1. Use a transition for two stable CSS states.
2. For a richer sequence, retain the Animation object and reverse or update it deliberately.
3. Try repeatedly changing direction during the first and last portions of travel.

## Before you ship

1. Does the object jump when its destination changes?
2. After two quick reversals, does the control’s accessible state match its final setting?
3. Can a stale completion handler undo a newer choice?
