# Reuse answers from earlier steps

- ID: form-11
- Category: Forms & inputs
- Tags: Efficiency, Forms
- URL: https://axiomui.nischal.fyi/rules/form-11

When a later step needs an earlier answer, fill it in or offer it as a choice. Let people change it.

- Do: Country and start date carried forward
- Don’t: Country and start date requested again

## Why it works

The itinerary already has the start date. Show it so the traveler can confirm or change it. Ask for the country if the only clue is the browser language.

- [WCAG 2.2 · Redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
- [GOV.UK · Check answers](https://design-system.service.gov.uk/patterns/check-answers/)
- [Baymard · Reusing a shipping address for billing](https://baymard.com/research-articles/set-billing-equal-to-shipping)
- [HTML · Autofill field names](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)

## What breaks

A traveler may overlook the wrong country in a form that looks complete. Defaulting the start date to today can book a trip for the wrong day.

## How to apply it

1. If a later step requires an earlier answer, prefill it or offer it for selection. WCAG 3.3.7 allows re-entry when it is essential, needed for security, or the earlier answer is no longer valid.
2. Set up browser autofill, too. The browser may have a saved address even if it has no record of the date entered earlier in this booking.
3. Ask when a wrong guess could affect the booking. Let travelers review earlier answers before confirming. WCAG 3.3.7 applies within one process. It does not require storing answers between visits.

## Before you ship

1. Where did this answer come from?
2. Can someone review and change it before submitting?
3. What happens if the form’s guess is wrong?
