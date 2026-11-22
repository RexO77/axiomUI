# Match selection controls to the choice

- ID: form-5
- Category: Forms & inputs
- Tags: Semantics, Forms
- URL: https://axiomui.nischal.fyi/rules/form-5

Use radio buttons for one choice and checkboxes for independent choices. A required radio group can start empty and require a selection on submission.

- Do: Pick a plan: radios (1 selected)
- Don’t: Pick a plan: checkboxes (2 selected)

## Why it works

A subscription has one plan, so choosing Business should clear Pro. Add-ons are independent. Selecting extra storage leaves the support option alone.

- [HTML · Radio button input state](https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio))
- [GOV.UK · Radio buttons](https://design-system.service.gov.uk/components/radios/)
- [GOV.UK · Checkboxes](https://design-system.service.gov.uk/components/checkboxes/)
- [WAI-ARIA APG · Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

## What breaks

With two plans checked, will you pay $12 for Pro, $24 for Business or $36 for both? If choosing one clears the other, use radio buttons.

## How to apply it

1. Name the group and give each option a distinct label.
2. Give the radio buttons for each question their own shared name attribute.
3. For an optional choice that must be clearable, provide a meaningful None option or another clear reset.

## Before you ship

1. Can more than one answer be valid?
2. Can a person leave an optional question unanswered after changing their mind?
3. Does keyboard selection follow the native control pattern?
