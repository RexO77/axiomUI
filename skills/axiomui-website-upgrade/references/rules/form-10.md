# Single column forms

- ID: form-10
- Category: Forms & inputs
- Tags: Forms, Efficiency
- URL: https://axiomui.nischal.fyi/rules/form-10

Multi-column forms slow completion. Use single column unless fields are logically paired (First/Last name, City/State).

- Do: Single column, stacked fields
- Don't: Two columns of unrelated fields

## Why it works

A single column keeps every field on one vertical scanning path, so the eye moves straight down without jumping across columns to figure out what comes next. Even two columns of unrelated fields break that path and force the user to decide, at each row, whether to read left-to-right or top-to-bottom. Logically paired fields, like First and Last name, are the one exception because they read as a single unit rather than separate decisions.

## What breaks

A three-column form places City next to Password next to Phone, so users lose their place mid-form and skip fields because the reading order is ambiguous.

## How to apply it

1. Stack unrelated fields in a single column rather than spreading them across three.
2. Only pair fields side by side when they are logically linked, like City and State.
3. Never split unrelated fields like address and payment info into parallel columns.
4. Check the tab order matches the single top-to-bottom visual path.

## Review questions

1. Are unrelated fields stacked in a single column rather than side by side?
2. Are only logically paired fields (like First/Last name) placed next to each other?
3. Does the tab order move straight down without jumping between columns?
