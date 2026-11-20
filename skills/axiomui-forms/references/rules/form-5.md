# Match selection controls to the choice

- ID: form-5
- Category: Forms & inputs
- Tags: Semantics, Forms
- URL: https://axiomui.nischal.fyi/rules/form-5

Use a radio group for one choice among alternatives and checkboxes for independent selections. A required radio group needs one answer by submission and can start unanswered.

- Do: Pick a plan: radios (1 selected)
- Don't: Pick a plan: checkboxes (2 selected)

## Why it works

Selecting Pro should replace Starter because one subscription has one plan. Independent add-ons have different behavior: choosing storage need not change the support option.

- [GOV.UK · Radio buttons](https://design-system.service.gov.uk/components/radios/)
- [GOV.UK · Checkboxes](https://design-system.service.gov.uk/components/checkboxes/)

## What breaks

Two checked plans leave the purchaser unable to predict the charge. Silently unchecking a neighboring checkbox also makes an independent-looking choice behave unexpectedly.

## How to apply it

1. Name the group and give each option a distinct label.
2. Put native radios with the same purpose in the same named group.
3. For an optional choice that must be clearable, provide a meaningful None option or another clear reset.

## Review questions

1. Can more than one answer be valid?
2. Can a person leave an optional question unanswered after changing their mind?
3. Does keyboard selection follow the native control pattern?
