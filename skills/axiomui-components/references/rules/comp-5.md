# Modal vs drawer

- ID: comp-5
- Category: Components & actions
- Tags: Overlays, Drawers, Semantics
- URL: https://axiomui.nischal.fyi/rules/comp-5

Use a modal for one short, focused decision; use a drawer for a context-heavy task where the user needs to keep seeing what sits behind it.

- Do: 1 decision = modal, 6 fields = drawer
- Don't: 1 decision = modal, 6 fields = modal

## Why it works

Modals interrupt and hide the background, which fits a short focused decision like a delete confirmation but actively works against tasks that need context, like editing a profile. Drawers keep the underlying screen visible so users retain their mental model of where they are while working through longer content.

## What breaks

Cramming complex settings into a small modal forces users to scroll a cramped box while losing sight of the page they came from, leading to abandoned edits and repeated re-opening of the dialog.

## How to apply it

1. Use a modal only for a single short decision — one question and one pair of buttons.
2. Use a drawer for a context-heavy task like editing a profile: six labelled fields fit its height, and the page behind stays readable.
3. Treat a rising field count as the signal to move from modal to drawer.
4. Never shrink a multi-section settings form into a small modal to save engineering time.

## Review questions

1. Is this modal reserved for a short, single decision rather than a complex task?
2. Does the drawer keep the background page visible while editing?
3. Would this task feel cramped if forced into a small modal?
