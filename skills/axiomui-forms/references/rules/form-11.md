# Reuse answers the user has supplied

- ID: form-11
- Category: Forms & inputs
- Tags: Efficiency, Forms
- URL: https://axiomui.nischal.fyi/rules/form-11

When a later booking step needs the same answer, carry it forward or let the person select it. Keep the answer editable when it may have changed. Ask for information the booking cannot supply.

- Do: Country and date reused from this booking
- Don't: Already supplied country and date requested again

## Why it works

The itinerary already holds the booking date. Asking the traveler to recall it on the next screen adds work and invites a conflicting answer. Offer the date for review. A country inferred from the browser language has a different origin and deserves a question.

- [WCAG 2.2 · Redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
- [HTML · Autofill field names](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)

## What breaks

A wrong prefilled destination can survive review precisely because the form looks complete. Defaulting an effective date to today can also create an unintended commitment.

## How to apply it

1. For a repeated required answer within one process, prefill it or make the prior answer available to select. WCAG 3.3.7 allows exceptions for essential re-entry, security, and information that has become invalid.
2. Give browser autofill the correct field metadata as a separate convenience. A browser may have no saved value for the date supplied earlier in this booking.
3. Ask for a consequential unknown, and let people review a known answer before committing. The repeated-entry criterion does not require storing personal answers between visits.

## Review questions

1. Where did this answer come from?
2. Can someone review and change it before submitting?
3. What happens if the form’s guess is wrong?
