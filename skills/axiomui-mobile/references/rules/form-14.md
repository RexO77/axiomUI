# Declare what each field expects

- ID: form-14
- Category: Forms & inputs
- Tags: Form fields, Forms, Mobile, Accessibility, WCAG
- URL: https://axiomui.nischal.fyi/rules/form-14

Set type, inputmode and autocomplete so browsers can offer the right keyboard and saved answers. Turn off spellcheck and automatic capitalization for email addresses, usernames and codes.

- Do: Email keyboard · saved email address suggested
- Don’t: Plain keyboard · capitalizes Maya@

## Why it works

An email field can put @ on the phone’s main keyboard. With `autocomplete=email`, the browser can also suggest a saved email address.

- [WCAG 2.2 · Identify input purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html)
- [GOV.UK · Email addresses](https://design-system.service.gov.uk/patterns/email-addresses/)
- [HTML · The inputmode attribute](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute)
- [HTML · Autocapitalization](https://html.spec.whatwg.org/multipage/interaction.html#autocapitalization)
- [HTML · Number input state](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number))
- [Chrome for Developers · SMS OTP forms](https://developer.chrome.com/docs/modern-web-guidance/guides/forms/sms-otp-form)

## What breaks

A generic field can capitalize the first letter, hide @ behind a keyboard switch, and leave people to type the entire address.

## How to apply it

1. Inspect generated inputs for type, inputmode, and autocomplete. Start with all fields labeled Email, Username, Card number, or Code, including fields rendered by shared components.
2. For email fields, set `type=email` and `autocomplete=email`. Turn off spellcheck and automatic capitalization for email addresses, usernames and codes. Use the matching autocomplete token, such as `username` or `one-time-code`.
3. Use `type=text` with `inputmode=numeric` for card numbers and numeric codes. Keep the value as text to preserve leading zeros. Reserve `type=number` for quantities people can increase or decrease.

## Before you ship

1. On a phone with a saved email address, tap Work email. Is @ on the main keyboard? Is the saved address offered? Type maya@. Does the m stay lowercase?
2. Does the sign-in field declare the purpose the browser’s credential manager expects?
3. If you enter 012345 in a numeric code field, does the first zero reach the form submission?
