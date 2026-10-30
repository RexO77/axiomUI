# Keyboard actions stay instant

- ID: motion-2
- Category: Motion & interaction
- Tags: Keyboard, Perceived performance
- URL: https://axiomui.nischal.fyi/rules/motion-2

Keyboard-driven actions are repeated constantly. Do not animate shortcuts, command palettes, or focus movement in ways that delay the result.

- Do: Keyboard panel: 0ms
- Don't: Keyboard panel: 240ms

## Why it works

Keyboard input assumes near-zero perceived latency, since repetition amplifies any added delay into visible lag. Shortcuts, palette toggles, and focus moves must resolve without waiting on a transition to finish.

## What breaks

A shortcut that waits for a slide-in transition before revealing its result trains users to distrust the keyboard path, and they fall back to slower mouse navigation.

## How to apply it

1. Land the shortcut result on the same frame as the keypress by updating state before, or independent of, any animation.
2. Never gate command palette open or close on a transition-end event.
3. Move focus synchronously and animate only the focus ring afterward, not the move itself.
4. Test rapid repeated keypresses to confirm no animation backlog queues up.

## Review questions

1. Does pressing a shortcut show its result instantly, with no visible wait?
2. Does the command palette open on keypress without a delay?
3. Does focus move immediately when triggered from the keyboard?
