# Input width hints

- ID: form-4
- Category: Forms & inputs
- Tags: Forms, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-4

Size a field to the content it expects. A full-width box for a five-character ZIP tells the user to keep typing, and a form of identical boxes gives the eye nothing to structure.

- Do: ZIP: 5-char width / Street: full width
- Don't: ZIP: full width / Street: full width

## Why it works

An input’s width is a visual promise about how much content belongs inside it, so a short field like a zip code should look short and a long field like a street address should look long. This uses affordance the same way a small jar signals it holds less than a large one. Full-width inputs for short answers break that promise and leave users unsure if they missed something.

## What breaks

A full-width zip code input makes users wonder whether they are supposed to enter more than five digits, so they hesitate or re-check the field before submitting.

## How to apply it

1. Size the Zip code input short and the Address input long, matching expected content length.
2. Never stretch a short-answer field to full container width.
3. Base width on the realistic maximum character count for that data type.
4. Pair width sizing with format hints for fields like zip or phone.

## Review questions

1. Does the zip code field look noticeably shorter than the address field?
2. Is any short-answer input stretched to the full width of the form?
3. Does each input’s width roughly match its expected content length?
