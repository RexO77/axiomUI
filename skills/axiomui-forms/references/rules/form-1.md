# Stack labels when space is tight

- ID: form-1
- Category: Forms & inputs
- Tags: Labels, Forms
- URL: https://axiomui.nischal.fyi/rules/form-1

Stack labels above fields on narrow screens or when label lengths vary. On wider screens, a shared label column can keep fields aligned. Leave room for translations to wrap.

- Do: Labels above · fields share one left edge
- Don’t: Uneven side labels push fields out of alignment

## Why it works

In the billing form, “Billing address” is longer than “Full name.” Putting each label directly above its control gives the controls a shared left edge even as either label wraps. On a wide, dense editor a shared label column can achieve the same alignment.

- [W3C WAI · Labeling form controls](https://www.w3.org/WAI/tutorials/forms/labels/)
- [Baymard · Field label placement on mobile](https://baymard.com/research-articles/mobile-form-usability-label-position)
- [GOV.UK · Text inputs](https://design-system.service.gov.uk/components/text-input/)
- [UXmatters · Label placement in forms](https://www.uxmatters.com/mt/archives/2006/07/label-placement-in-forms.php)

## What breaks

Giving each side label only its own text width makes the input column jump from row to row. Truncating labels to fix the alignment can hide the distinction between two questions.

## How to apply it

1. Connect each visible label to its field. In HTML, match the label’s for attribute to the field’s id.
2. Leave space for long labels and instructions to wrap.
3. At narrow widths and with larger text, check that each label stays with its field. Repeat with a longer translation.

## Before you ship

1. Can someone match each label to its control at a glance?
2. Can you still read the whole label when it wraps?
3. Does the accessible name still make sense when read on its own?
