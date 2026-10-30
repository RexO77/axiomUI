# Disabled needs a reason

- ID: comp-8
- Category: Components & actions
- Tags: States, Tooltips, Clarity
- URL: https://axiomui.nischal.fyi/rules/comp-8

Disabled controls without explanation feel broken. Add a tooltip or helper text.

- Do: Disabled + reason under the button
- Don't: Disabled + no reason

## Why it works

A disabled control answers no question: it does not say what is missing, and the native disabled attribute also drops the element out of the tab order, so a keyboard or screen-reader user cannot even reach a tooltip hung on it. Visible helper text, or aria-disabled in place of disabled so the control stays focusable, restores the link between the blocked state and the thing the user has to do to clear it.

## What breaks

A grayed-out Save with nothing beside it gets clicked three or four times, because the user reads the page as broken rather than guessing that a required field two sections up is still empty, and the ticket that follows reports the save button as dead.

## How to apply it

1. Pair every disabled control with visible text naming the unmet condition.
2. Prefer aria-disabled=true over the disabled attribute when the reason lives in a tooltip, so Tab still reaches it, and guard the handler yourself since aria-disabled does not block activation.
3. Name the fix, not the state: two fields left to fill, rather than this action is unavailable.
4. Keep the explanation within a line or two of the control so the connection is unambiguous.

## Review questions

1. Does this disabled control have a visible reason sitting next to it?
2. Does that text name what the user must do to enable it?
3. Can a keyboard user reach the control and find out why it is unavailable?
