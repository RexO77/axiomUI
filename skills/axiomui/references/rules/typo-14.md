# Isolate names in mixed-direction text

- ID: typo-14
- Category: Typography & text
- Tags: Localization, Bidirectional text, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-14

A name that reads in the opposite direction can change where a dash and count appear. Wrap just the name in `<bdi>` to keep the count with the sentence.

- Do: Restaurant name in `<bdi>` · count stays with the review text
- Don’t: Restaurant name in `<span>` · count can change position

## Why it works

In the English list, the dash and 5 can appear before the Hebrew name. Isolating just the name keeps the 5 with “reviews”. The same issue can arise with an English name in a Hebrew list.

- [W3C Internationalization · Inline bidirectional text](https://www.w3.org/International/articles/inline-bidi-markup/)
- [WHATWG HTML · The bdi element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-bdi-element)
- [W3C Internationalization · Document direction](https://www.w3.org/International/questions/qa-html-dir)
- [Unicode MessageFormat · Variables](https://messageformat.unicode.org/docs/reference/variables/)
- [Mozilla · Localization best practices](https://mozilla-l10n.github.io/documentation/localization/dev_best_practices.html)

## What breaks

A misplaced dash or count can make the number look like part of the restaurant’s name. Changing the row’s alignment leaves that order unchanged.

## How to apply it

1. Set the document’s base direction for the interface language. The language attribute alone does not set direction.
2. Wrap just the name in `<bdi>` if its direction is unknown. If it already has its own wrapper, use `dir="auto"` on that element. Leave the dash and count outside.
3. Keep the sentence in translation resources so the translator can position the name and count. Keep the name in its original character order.

## Before you ship

1. In an English row with a Hebrew name, does the count read as part of the review phrase?
2. Does a Latin name keep its own order in a Hebrew row?
3. Have readers of each language checked the punctuation at the displayed size?
