# Subsequent tooltips are instant

- ID: motion-11
- Category: Motion & interaction
- Tags: Tooltips, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-11

The first tooltip can wait to avoid accidents. Once a tooltip is open, adjacent tooltips should appear immediately.

- Do: First tooltip 300ms, then 0ms
- Don't: Every tooltip 300ms

## Why it works

The first tooltip in a session can carry a short delay to avoid firing on accidental hover, but once a user is already exploring, skipping that delay for adjacent tooltips respects the established intent and keeps a toolbar feeling continuous rather than stuttering per item.

## What breaks

Every toolbar icon re-imposing the same hover delay makes scanning a row of tools feel like restarting a wait each time, so users abandon hover exploration and hunt for labels another way.

## How to apply it

1. Skip the delay for any tooltip triggered shortly after another.
2. Keep a short shared window, roughly 1 to 1.5 seconds, after the last tooltip closes before resetting to first-open behavior.
3. Reserve the initial delay only for the very first tooltip in a session.
4. Test moving quickly across a toolbar to confirm no per-item delay reappears.

## Review questions

1. Does the first tooltip in a session wait briefly before appearing?
2. Do adjacent tooltips appear instantly once you’re already hovering the toolbar?
3. Does every toolbar item impose its own separate hover delay?
