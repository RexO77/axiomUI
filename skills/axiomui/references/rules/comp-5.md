# Choose a surface for the task

- ID: comp-5
- Category: Components & actions
- Tags: Overlays, Drawers, Semantics
- URL: https://axiomui.nischal.fyi/rules/comp-5

Use a modal when the current decision needs exclusive attention. Use a side panel when the surrounding page helps someone compare or edit information. Choose a full page if either surface would leave too little working room.

- Do: Profile editor beside the visible record
- Don't: Six profile fields in a one-row modal viewport

## Why it works

A drawer describes placement. Modality describes whether someone can continue using the rest of the interface. A side-by-side editor can keep a record in view while a person changes it, but a modal drawer still blocks interaction with that record.

- [Fluent · Inline and overlay drawers](https://fluent2.microsoft.design/components/web/react/core/drawer/usage)
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## What breaks

If an editor asks someone to copy a value from a table behind a modal, the needed information can be visible yet unreachable. A narrow drawer can create the same trouble by obscuring the table.

## How to apply it

1. Identify which background information the task requires.
2. Choose a nonmodal split view when the task requires interaction with both surfaces.
3. Test a long field, the onscreen keyboard and the smallest supported viewport before committing to the panel.

## Review questions

1. Can the user see the information needed to finish?
2. Can they interact with the underlying page when the task calls for it?
3. Would a dedicated page give a complex task a clearer sequence?
