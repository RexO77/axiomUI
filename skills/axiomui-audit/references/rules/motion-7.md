# Tune entrance and exit separately

- ID: motion-7
- Category: Motion & interaction
- Tags: Timing, Exit, Entry
- URL: https://axiomui.nischal.fyi/rules/motion-7

A toast can arrive slowly enough to locate and leave quickly once dismissed. Choose each direction’s timing for what the user needs to follow.

- Do: Enter 220ms, exit 160ms
- Don't: Enter 360ms, exit 360ms

## Why it works

On entry, a toast introduces information. On dismissal, the next task may already be underway. The example gives entry 220ms and exit 160ms. A dismissal that visibly returns an object to its destination may warrant more time than a routine fade.

- [IBM Carbon · Motion principles and timing](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview)
- [WCAG 2.2 · Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## What breaks

An exit can block the next click if its invisible layer still intercepts input. An exit that is too brief can hide where the object went.

## How to apply it

1. Set aside enough time to read a message before its dismissal begins.
2. Keep focus on the person’s current task when a passive status toast appears or disappears. If a person dismisses it from a focused toast action, move focus to a logical surviving control.
3. Interrupt an entrance with a dismissal and check the result.

## Review questions

1. Can the message be read before it goes away?
2. Where does the next click or keystroke go?
3. Does the destination of a moving item remain clear?
