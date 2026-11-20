# Match the control to when the change takes effect

- ID: form-7
- Category: Forms & inputs
- Tags: Semantics, Forms
- URL: https://axiomui.nischal.fyi/rules/form-7

Use a switch for an on/off setting that applies as it changes. A checkbox fits an option submitted with the rest of a form. Make the save behavior clear wherever the two appear together.

- Do: Dark mode = switch, email updates = checkbox
- Don't: Dark mode = switch, email updates = switch

## Why it works

Dark mode gives immediate evidence when the theme changes. A subscription preference in an account form may still require Save. The visual position of a toggle alone cannot explain whether an update reached the service.

- [WAI-ARIA APG · Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)
- [Fluent · Switch behavior](https://fluent2.microsoft.design/components/web/react/core/switch/usage)

## What breaks

Someone who turns on product emails and leaves before pressing Save may believe they subscribed. An instantly applied change that fails to save needs equally clear recovery.

## How to apply it

1. Use a stable setting label as a switch changes state.
2. Use a checkbox for a pending choice when that matches the surrounding form.
3. If saving fails, show the actual saved state and an appropriate recovery action.

## Review questions

1. Which settings take effect immediately?
2. Is the save boundary visible?
3. Does the announced state match the value that will persist?
