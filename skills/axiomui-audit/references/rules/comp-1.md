# Action hierarchy

- ID: comp-1
- Category: Components & actions
- Tags: Buttons, Hierarchy
- URL: https://axiomui.nischal.fyi/rules/comp-1

Give a screen one primary action and demote the rest to outline or text-link styling. Two equally loud buttons make the user choose before they have understood the choice.

- Do: 1 filled + 1 outline + 1 ghost button
- Don't: 3 filled buttons side by side

## Why it works

A filled button is usually the only solid color field on the screen, so the eye finds it pre-attentively, before a single label is read. That makes it a pointer to the next step rather than one more thing to evaluate. Put three filled buttons side by side and the pointer disappears: every candidate now carries the same visual weight, so the user has to read and rank all three before acting.

## What breaks

A checkout footer with three filled buttons — save, continue, place order — forces users to read every label before acting, and the wrong one gets hit often enough that teams start bolting on confirmation dialogs to patch it.

## How to apply it

1. Keep exactly one filled button per view and step the rest down: an outline for the next-likeliest action, a ghost for everything after it.
2. Give the filled slot to the action most users should take next, not the one that matters most to the business.
3. Audit dialogs and form footers for a second filled button arriving from a shared component.
4. If two actions genuinely feel equal, treat that as a flow problem, not a styling one.

## Review questions

1. Is there exactly one filled button visible on this screen?
2. Are the remaining actions stepped down to outline and ghost rather than left filled?
3. Does the filled button match the action most users should take next?
