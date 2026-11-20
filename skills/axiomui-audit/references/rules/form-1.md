# Keep labels close to their fields

- ID: form-1
- Category: Forms & inputs
- Tags: Labels, Forms
- URL: https://axiomui.nischal.fyi/rules/form-1

Stack labels above fields when space is narrow or label lengths vary. A side-label layout can work when it preserves the association and has room for translated text.

- Do: Label above input
- Don't: Label left of input

## Why it works

In the billing form, “Billing address” is longer than “Full name.” Putting each label directly above its control gives the controls a shared left edge even as either label wraps. On a wide, dense editor a shared label column can achieve the same alignment.

- [W3C WAI · Labeling form controls](https://www.w3.org/WAI/tutorials/forms/labels/)
- [GOV.UK · Text inputs](https://design-system.service.gov.uk/components/text-input/)

## What breaks

Giving each side label only its own text width makes the input column jump from row to row. Truncating labels to fix the alignment can hide the distinction between two questions.

## How to apply it

1. Give each field a programmatic label.
2. Leave space for long labels and instructions to wrap.
3. Inspect the association at a narrow width, with larger text and in a supported language with longer strings.

## Review questions

1. Can someone match each label to its control at a glance?
2. Does the full label survive reflow?
3. Does the accessible name still make sense when read on its own?
