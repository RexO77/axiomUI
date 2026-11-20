# Review motion slowly, then at normal speed

- ID: motion-25
- Category: Motion & interaction
- Tags: Polish, Timing
- URL: https://axiomui.nischal.fyi/rules/motion-25

Slow playback to inspect a transition frame by frame. Return to normal speed to judge whether it suits the task.

- Do: Inspect at 2x-5x duration
- Don't: Judge only at full speed

## Why it works

Slower playback separates changes that overlap in real time. A discontinuity in opacity can be easy to locate by scrubbing, even when it appears only as a flash during ordinary use. A slowed recording cannot tell you how responsive the shipped interaction feels.

- [Chrome DevTools · Inspecting animations](https://developer.chrome.com/docs/devtools/css/animations)

## What breaks

Fixing every visible difference between two property curves can remove an intentional offset. Designing only at quarter speed can also disguise an entrance that is too long.

## How to apply it

1. Compare the endpoints before changing the curves.
2. Scrub through the frame where a flash or jump appears.
3. Replay at the intended speed and interrupt the interaction with a second input.

## Review questions

1. Which property creates the unexpected frame?
2. Is an offset deliberate and useful at normal speed?
3. Does a real input interrupt the sequence cleanly?
