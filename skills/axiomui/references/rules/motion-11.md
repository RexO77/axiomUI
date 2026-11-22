# Delay only the first hover tooltip in a toolbar

- ID: motion-11
- Category: Motion & interaction
- Tags: Tooltips, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-11

Wait 300ms before opening the first tooltip on hover. Then show neighboring tooltips immediately. Restore the delay after the pointer has been away for 300ms.

- Do: Hover delay · 300ms first, then 0ms
- Don’t: Hover delay · 300ms on every tool

## Why it works

The first delay keeps tooltips from flashing as the pointer crosses the toolbar. Once a tooltip opens, a short grace period lets someone cross gaps between buttons without waiting again. Keyboard focus can show the tooltip immediately.

- [React Aria · Tooltip interactions and delays](https://react-aria.adobe.com/Tooltip)
- [Base UI · Tooltip provider](https://base-ui.com/react/components/tooltip)
- [WCAG 2.2 · Content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)
- [Radix · Tooltip provider and delay](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [NN/g · Timing guidelines for exposing hidden content](https://www.nngroup.com/articles/timing-exposing-content/)

## What breaks

Independent delays make a row of unfamiliar icons tedious to inspect. Hiding a tip as soon as the pointer leaves its trigger can also prevent someone from moving over the text to read it.

## How to apply it

1. Share the first-hover delay across neighboring toolbar buttons.
2. Provide the information on keyboard focus and allow Escape to dismiss it.
3. Keep the tip open while the pointer is over the trigger or its content where WCAG hover-content requirements apply.

## Before you ship

1. Do any tooltips flash when you move quickly across the toolbar?
2. Can someone travel from a trigger onto its tip?
3. After leaving and returning, does the initial delay reset?
