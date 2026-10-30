# Checkbox vs radio

- ID: form-5
- Category: Forms & inputs
- Tags: Semantics, Forms
- URL: https://axiomui.nischal.fyi/rules/form-5

A radio group means pick exactly one; checkboxes mean pick any number. The control's shape is the only promise the user gets before they click, so breaking it costs them a retry.

- Do: Pick a plan: radios (1 selected)
- Don't: Pick a plan: checkboxes (2 selected)

## Why it works

Radio buttons and checkboxes carry different built-in signifiers: a circle means one exclusive choice, a square means any number of independent choices. Pick a plan is a mutually exclusive decision, so it needs the circle. Swapping in checkboxes contradicts decades of learned convention and forces users to re-derive the selection rule from scratch instead of recognizing it instantly.

## What breaks

Checkboxes under Pick a plan let a user leave both Pro and Business ticked, so the form either silently keeps whichever it read last or posts a two-plan state the billing code has no price for.

## How to apply it

1. Use radio buttons for Pick a plan, since only one plan can be active at a time.
2. Reserve checkboxes for choices where multiple selections are valid simultaneously.
3. Never let two checkbox options in the same group behave as mutually exclusive.
4. Audit any checkbox group that only ever allows one item checked; convert it to radios.

## Review questions

1. Are mutually exclusive choices like Pick a plan shown as radio buttons, not checkboxes?
2. Can more than one option be selected where only one choice makes sense?
3. Does the control’s shape (circle vs square) match how many can be selected?
