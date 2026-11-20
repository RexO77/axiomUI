# Sequence panel content when order explains something

- ID: motion-26
- Category: Motion & interaction
- Tags: Entry, Stagger
- URL: https://axiomui.nischal.fyi/rules/motion-26

Reveal related groups in sequence when the order helps explain a change. Present a routine dialog together when people need to read and act immediately.

- Do: Title, copy, actions staggered 90ms
- Don't: Title, copy, actions in one fade

## Why it works

A heading, supporting detail and action can arrive in stages to introduce a new workflow. An experienced user reopening the same confirmation dialog already knows its structure and may want the action immediately. Reading order and labels carry the hierarchy even with animation turned off.

- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Motion · Staggering animations](https://motion.dev/docs/stagger)

## What breaks

An action that receives focus while it is still transparent can leave a keyboard user unable to see where they are. A late title can also arrive after the user starts reading its body.

## How to apply it

1. Choose the specific relationship the sequence should communicate.
2. Keep the title and initially focused control visible on open.
3. Compare the staged version with a single entrance during repeated use.

## Review questions

1. What information does the order reveal?
2. Can the user see and use the initial focus target immediately?
3. Does the hierarchy remain clear with every group displayed together?
