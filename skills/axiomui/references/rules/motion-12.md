# Retarget interrupted motion from its current position

- ID: motion-12
- Category: Motion & interaction
- Tags: Animation API, CSS
- URL: https://axiomui.nischal.fyi/rules/motion-12

When a control reverses mid-transition, continue from its visible position. A CSS transition handles ordinary state changes. A controlled keyframe animation can reverse too.

- Do: transition: transform 420ms
- Don't: animation: turn 420ms

## Why it works

A toggle may receive another click before it finishes moving. A CSS transition uses the current interpolated value when the target changes. Replaying a new animation from a fixed endpoint loses that position. A retained Web Animation can reverse its timeline, preserving continuity.

- [CSS Transitions · Reversing an interrupted transition](https://www.w3.org/TR/css-transitions-1/#reversing)
- [W3C · Web Animations timing and playback](https://www.w3.org/TR/web-animations-1/)

## What breaks

An interrupted toggle can jump ahead to a state it never visibly reached, then move back toward the requested one.

## How to apply it

1. Use a transition for two stable CSS states.
2. For a richer sequence, retain the Animation object and reverse or update it deliberately.
3. Try repeatedly changing direction during the first and last portions of travel.

## Review questions

1. Does the object jump when its destination changes?
2. Does the semantic state reflect the latest input?
3. Can a stale completion handler undo a newer choice?
