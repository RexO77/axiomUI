# Format hints

- ID: form-9
- Category: Forms & inputs
- Tags: Validation, Guidance, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-9

When a field accepts only one format, show an example beside it. Readers copy the shape of an example far faster than they decode an error message about the guess they just made.

- Do: MM / YY hint
- Don't: No format hint

## Why it works

A strict input pattern, like a two-digit month and year, is invisible until the user guesses wrong, so showing the MM / YY hint upfront turns a trial-and-error task into a fill-in-the-blank one. This front-loads the format constraint instead of revealing it only after a failed submission. Hints reduce the number of rejected attempts on fields with rigid formatting rules.

## What breaks

A card expiry field with no hint gets entered as 2027 or March 27, both rejected, so the user resubmits multiple times before landing on the exact MM / YY pattern the system expects.

## How to apply it

1. Show the MM / YY hint directly in or beside any field with a strict format.
2. Never leave a pattern-constrained field without an example of the expected format.
3. Place the hint where it stays visible while typing, not just in a tooltip that disappears.
4. Apply this to any rigid pattern: phone numbers, postal codes, card numbers.

## Review questions

1. Does every strictly formatted field show an example like MM / YY nearby?
2. Is the hint visible while the user is actively typing, not hidden in a tooltip?
3. Would a first-time user know the exact expected format without guessing?
