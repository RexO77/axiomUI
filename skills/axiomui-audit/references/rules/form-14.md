# Declare what each field expects

- ID: form-14
- Category: Forms & inputs
- Tags: Form fields, Forms, Mobile, Accessibility, WCAG
- URL: https://axiomui.nischal.fyi/rules/form-14

Declare the input type, keyboard layout, and autocomplete purpose so the browser can offer the right keys and saved answers. Turn off spellcheck and automatic capitalization for identifiers such as emails, usernames, and codes.

- Do: Email keyboard · saved address suggested
- Don't: Plain keyboard · capitalizes Maya@

## Why it works

A phone can put @ on the first keyboard layer for Work email and offer an address the person has already saved. Declaring the field’s purpose gives the browser the information it needs to offer both.

- [WCAG 2.2 · Identify input purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html)
- [HTML · Input modalities: inputmode](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute)
- [GOV.UK · Email addresses](https://design-system.service.gov.uk/patterns/email-addresses/)

## What breaks

A generic field can capitalize the first letter, hide @ behind a keyboard switch, and leave people to type the entire address.

## How to apply it

1. Inspect generated inputs for type, inputmode, and autocomplete. Start with all fields labeled Email, Username, Card number, or Code, including fields rendered by shared components.
2. Use type=email and autocomplete=email for an email field. Turn off spellcheck and autocapitalize for emails, usernames, and codes. Use the autocomplete token that matches the field’s purpose, such as username or one-time-code.
3. Use type=text with inputmode=numeric for digit strings such as card numbers and numeric codes. Keep them as strings so leading zeros survive. Reserve type=number for quantities that can be incremented.

## Review questions

1. On a phone with a saved autofill address, tap Work email, check for @ and the saved address, then type maya@. Does the name stay lowercase?
2. Does the sign-in field declare the purpose the browser’s credential manager expects?
3. If you enter 012345 in a numeric code field, does the first zero reach the form submission?
