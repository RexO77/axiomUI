# Use sentence case for English UI labels

- ID: typo-1
- Category: Typography & text
- Tags: Labels, Headings, Buttons
- URL: https://axiomui.nischal.fyi/rules/typo-1

Use sentence case for ordinary English labels and headings. Keep the spelling of names and acronyms intact, including title case in official titles. Follow the casing conventions of each translation.

- Do: Invite your team / Skip for now
- Don't: Invite Your Team / Skip For Now

## Why it works

In an invite dialog, the title and actions belong to the same conversation. A writer who knows the team uses sentence case can write “Invite your team” without deciding whether “your” counts as a title word. Keeping “Sign in with GitHub” intact also preserves the service’s own spelling.

- [Microsoft Writing Style Guide · Capitalization](https://learn.microsoft.com/en-us/style-guide/capitalization)

## What breaks

A blanket lowercase transform can silently turn GitHub into Github or change an acronym. In translated copy the same transform can undo an editor’s language-specific choices.

## How to apply it

1. Write the final casing in the localized string.
2. Keep a short list of the product names and abbreviations writers actually encounter.
3. Use the invite dialog to review a title and an action together.

## Review questions

1. Does the label follow the convention for this language?
2. Does a named service retain its own spelling?
3. Will the localized string reach the screen as written?
