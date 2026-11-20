# Keep field labels visible

- ID: form-2
- Category: Forms & inputs
- Tags: Labels, Forms, Accessibility
- URL: https://axiomui.nischal.fyi/rules/form-2

Keep a visible label after typing or autofill. A placeholder can illustrate an entry, but it disappears precisely when someone needs to review the completed form.

- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address

## Why it works

Returning to a filled address form, “London” could be the city of birth or a delivery destination. The field’s value cannot reliably tell the reader which question it answered.

- [HTML · The placeholder attribute](https://html.spec.whatwg.org/multipage/input.html#the-placeholder-attribute)

## What breaks

A browser can fill several fields before the user sees the placeholders. A screen full of values without labels becomes difficult to check or correct.

## How to apply it

1. Associate each visible label with its control.
2. Keep essential format instructions visible outside the placeholder.
3. Review the form empty, partially filled and autofilled.

## Review questions

1. Can someone identify each filled field?
2. Can they find its instructions while editing?
3. Does a screen reader announce the same purpose as the visible label?
