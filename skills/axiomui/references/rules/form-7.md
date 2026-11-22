# Use switches for changes that apply immediately

- ID: form-7
- Category: Forms & inputs
- Tags: Semantics, Forms
- URL: https://axiomui.nischal.fyi/rules/form-7

Use a switch for a setting that takes effect immediately. Use a checkbox for a choice that waits for Save. When both appear together, label which changes need saving.

- Do: Email updates · checkbox takes effect after Save changes
- Don’t: Email updates · switch still waits for Save changes

## Why it works

Switching on Dark mode changes the theme immediately. “Email me product updates” waits for Save changes. A switch there can make a pending subscription look active.

- [Fluent · Switch behavior](https://fluent2.microsoft.design/components/web/react/core/switch/usage)
- [Microsoft Windows · Toggle switches](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/toggles)
- [WAI-ARIA APG · Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)
- [IBM Carbon · Toggle](https://www.carbondesignsystem.com/building-blocks/core/components/toggle/guidelines)

## What breaks

Someone who leaves before pressing Save changes may think they subscribed to product updates. If an instant save fails, show which setting is still active.

## How to apply it

1. Keep the switch label “Dark mode” in both states. Let the switch indicate on or off.
2. Use a checkbox for an option that takes effect when the form is saved.
3. If saving fails, show the stored setting and how to try again.

## Before you ship

1. Which settings take effect immediately?
2. Can you tell which settings wait for Save changes?
3. Does the announced state match the value that will persist?
