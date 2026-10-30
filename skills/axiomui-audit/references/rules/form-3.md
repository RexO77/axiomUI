# Mark optional, not required

- ID: form-3
- Category: Forms & inputs
- Tags: Labels, Clarity
- URL: https://axiomui.nischal.fyi/rules/form-3

If 90% of fields are required, don't put red asterisks everywhere. Just mark the exceptions as (Optional).

- Do: Full name · Email · Phone (Optional)
- Don't: Full name * · Email * · Phone *

## Why it works

Marking every field with a red asterisk adds a decoding step to each row: the eye has to check the symbol, recall what it means, then read the label. When 90% of fields share that state, the asterisk stops carrying information and just becomes visual noise the user has to filter out. Flagging only the exceptions, like Phone (Optional), cuts the number of symbols to parse to almost zero.

## What breaks

A ten-field form shows nine asterisks and users start ignoring them entirely, so the one truly optional field gets filled in anyway, adding friction the form was trying to avoid.

## How to apply it

1. Label optional fields directly, e.g. Phone (Optional), and leave required fields unmarked.
2. Remove asterisks from Full name, Email, and any other required field.
3. Only introduce a required marker if optional fields outnumber required ones.
4. Scan the form for asterisk density before shipping; more than one or two is a signal to invert the pattern.

## Review questions

1. Are optional fields the only ones carrying an explicit marker?
2. Is the form free of asterisks on the majority of required fields?
3. Can a user tell which fields are optional without reading every label?
