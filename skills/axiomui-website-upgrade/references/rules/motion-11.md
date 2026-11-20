# Share tooltip timing across a toolbar

- ID: motion-11
- Category: Motion & interaction
- Tags: Tooltips, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-11

Delay the first hover tooltip while a pointer crosses the toolbar. Once it opens, reveal adjacent tips without another wait. Reset after the pointer leaves the group.

- Do: First tooltip 300ms, then 0ms
- Don't: Every tooltip 300ms

## Why it works

Hovering briefly while traveling to another control is different from pausing to read a label. A short warmup handles the first case. A shared cooldown lets someone move between neighboring tools before that delay starts again. Keyboard focus is deliberate and can reveal the tip immediately.

- [React Aria · Tooltip interactions and delays](https://react-aria.adobe.com/Tooltip)
- [WCAG 2.2 · Content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

## What breaks

Independent delays make a row of unfamiliar icons tedious to inspect. Hiding a tip as soon as the pointer leaves its trigger can also prevent someone from moving over the text to read it.

## How to apply it

1. Share one warmup state across neighboring triggers.
2. Provide the information on keyboard focus and allow Escape to dismiss it.
3. Keep the tip open while the pointer is over the trigger or its content where WCAG hover-content requirements apply.

## Review questions

1. Does a pass across unopened tools avoid a flash of unwanted tips?
2. Can someone travel from a trigger onto its tip?
3. After leaving and returning, does the initial delay reset?
