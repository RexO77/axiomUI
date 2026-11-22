# Choose a dialog, side panel or full page

- ID: comp-5
- Category: Components & actions
- Tags: Overlays, Drawers, Semantics
- URL: https://axiomui.nischal.fyi/rules/comp-5

Use a modal dialog for a decision that needs full attention. Use a side panel when people need the page beside the form. Give the task a full page when it needs more room.

- Do: All six profile fields visible beside the record
- Don’t: Only one of six profile fields fully visible

## Why it works

A side panel can be modal or nonmodal. Both can leave the record visible. Only a nonmodal panel lets someone use the record while editing.

- [Fluent · Inline and overlay drawers](https://fluent2.microsoft.design/components/web/react/core/drawer/usage)
- [IBM Carbon · Modal content and sizing](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines#overflow-content)
- [WAI-ARIA APG · Modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Apple HIG · Modality](https://developer.apple.com/design/human-interface-guidelines/modality)

## What breaks

The small dialog shows just one of six profile fields and dims the record behind it. A side panel can also get in the way if it covers a value someone needs.

## How to apply it

1. Identify which background information the task requires.
2. Use a nonmodal side panel when people need to work in the form and the record beside it.
3. Test a long field, the onscreen keyboard and the smallest supported viewport before committing to the panel.

## Before you ship

1. Can the user see the information needed to finish?
2. Can they interact with the underlying page when the task calls for it?
3. Would a full page give this task enough room?
