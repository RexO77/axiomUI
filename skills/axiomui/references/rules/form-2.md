# No placeholders as labels

- ID: form-2
- Category: Forms & inputs
- Tags: Labels, Forms, Accessibility
- URL: https://axiomui.nischal.fyi/rules/form-2

Placeholders disappear when you type. Users forget what the field was. Use persistent labels.

- Do: Label: Work email / Placeholder: you@company.com
- Don't: Label: none / Placeholder: Email address

## Why it works

Placeholder text vanishes the instant a user types the first character, so the field’s identity has to be held in working memory for the rest of the entry. Working memory for that kind of transient detail is fragile, especially on longer forms or when a user gets interrupted mid-field. A persistent label keeps the field’s purpose visible the entire time, while the placeholder is free to hold a format example instead.

## What breaks

A user tabs back to a field after being interrupted and finds an empty box with no label, so they cannot tell if it is the email field or the name field without retyping to check.

## How to apply it

1. Always render a persistent label like Email above the field, never only a placeholder.
2. Reserve the placeholder for a format example, such as you@example.com.
3. Never let the placeholder be the only text identifying the field.
4. Check that the label remains visible after the user starts typing.

## Review questions

1. Does a persistent label stay visible after text is entered?
2. Is the placeholder used only for an example format, not as the field name?
3. Would the field’s purpose still be clear if the input were fully typed over?
