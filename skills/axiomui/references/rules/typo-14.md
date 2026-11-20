# Keep names and counts together across scripts

- ID: typo-14
- Category: Typography & text
- Tags: Localization, Bidirectional text, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-14

A name inserted into a translated sentence can run in either direction. Isolate the name so the browser keeps the surrounding punctuation and count with the sentence.

- Do: Isolate the restaurant name before its review count
- Don't: Insert the name directly before the dash and count

## Why it works

On an English restaurant list, a Hebrew name may sit directly before a dash and a number. The browser resolves these characters using their neighbors. Marking the name as its own span of directional text lets the number stay with the English word “reviews”. The same issue arises with a Latin name on a Hebrew page.

- [W3C Internationalization · Inline bidirectional text](https://www.w3.org/International/articles/inline-bidi-markup/)
- [W3C Internationalization · Document direction](https://www.w3.org/International/questions/qa-html-dir)

## What breaks

A restaurant can appear to have a number in its name, or the dash can move to the wrong side of the count. Aligning the whole row to the reading start leaves the ambiguous character sequence intact.

## How to apply it

1. Set the document’s base direction for the interface language. The language attribute alone does not set direction.
2. Wrap an inserted name of unknown direction in `<bdi>`. A tightly wrapped element with `dir="auto"` can also isolate the name. Keep the separator and count outside that wrapper.
3. Keep the sentence in translation resources so the translator can position the name and count. Keep the name in its original character order.

## Review questions

1. In an English row with a Hebrew name, does the count read as part of the review phrase?
2. Does a Latin name keep its own order in a Hebrew row?
3. Have readers of each language checked the punctuation at the displayed size?
