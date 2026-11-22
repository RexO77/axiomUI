# Keep field labels visible

- ID: form-2
- Category: Forms & inputs
- Tags: Labels, Forms, Accessibility
- URL: https://axiomui.nischal.fyi/rules/form-2

Give each field a label that stays visible after typing or autofill. Use the placeholder for an example that can disappear.

- Do: Label: Work email / Placeholder: you@company.com
- Don’t: Label: none / Placeholder: Email address

## Why it works

In a filled form, “London” could be a birthplace or a delivery city. A visible label tells you which answer you’re checking.

- [HTML · The placeholder attribute](https://html.spec.whatwg.org/multipage/input.html#the-placeholder-attribute)
- [NN/g · Placeholders in form fields](https://www.nngroup.com/articles/form-design-placeholders/)
- [W3C WAI · Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [GOV.UK · Text inputs](https://design-system.service.gov.uk/components/text-input/)

## What breaks

A browser can fill several fields before the user sees the placeholders. A screen full of values without labels becomes difficult to check or correct.

## How to apply it

1. Associate each visible label with its control.
2. Keep essential format instructions visible outside the placeholder.
3. Review the form empty, partially filled and autofilled.

## Before you ship

1. Can someone identify each filled field?
2. Can they find its instructions while editing?
3. Does a screen reader announce the same purpose as the visible label?
