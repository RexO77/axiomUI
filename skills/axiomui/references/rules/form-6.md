# Dropdown vs radio

- ID: form-6
- Category: Forms & inputs
- Tags: Efficiency, Forms
- URL: https://axiomui.nischal.fyi/rules/form-6

With fewer than five options, show them all as radio buttons instead of hiding them in a dropdown. A dropdown costs a click and hides the shape of the choice until you open it.

- Do: 3 options = radios (3 of 3 visible)
- Don't: 3 options = dropdown (0 of 3 visible)

## Why it works

A dropdown hides its options behind a click, so choosing among them takes two interactions and forces recall of what was inside before the user opened it. Radio buttons for a small set expose every option in one glance, turning the decision into simple recognition. Below roughly five options, the extra click a dropdown demands outweighs the space it saves.

## What breaks

A three-option dropdown adds an unnecessary click and hides the choices from view, so users have to open the menu just to see what they can even pick.

## How to apply it

1. Render fewer than five options as radio buttons instead of a dropdown.
2. Reserve dropdowns for long option lists where showing everything would overwhelm the layout.
3. Count the actual number of choices before picking the control, not just habit.
4. Watch for the extra click a dropdown adds and eliminate it below the five-option threshold.

## Review questions

1. If a field has fewer than five options, are they shown as radio buttons?
2. Does choosing an option require an extra click to open a menu first?
3. Are all available choices visible without any interaction for short lists?
