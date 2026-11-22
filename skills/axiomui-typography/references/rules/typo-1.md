# Use sentence case for English UI labels

- ID: typo-1
- Category: Typography & text
- Tags: Labels, Headings, Buttons
- URL: https://axiomui.nischal.fyi/rules/typo-1

Use sentence case for ordinary English labels and headings. Keep the spelling of names and acronyms intact, including title case in official titles. Follow the casing conventions of each translation.

- Do: Invite your team / Skip for now
- Don’t: Invite Your Team / Skip For Now

## Why it works

“Invite your team” and “Skip for now” follow the same casing rule. Product names keep their own capitals, as in “Sign in with GitHub”.

- [Microsoft Writing Style Guide · Capitalization](https://learn.microsoft.com/en-us/style-guide/capitalization)
- [Adobe Spectrum · Grammar and mechanics](https://spectrum.adobe.com/content/grammar-and-mechanics)
- [Mozilla · Localized text capitalization](https://mozilla.github.io/ecosystem-platform/reference/localization)
- [Atlassian Design · Button usage](https://atlassian.design/components/button/usage)

## What breaks

A lowercase transform turns GitHub into github. It can also change acronyms and override a translator’s capitalization.

## How to apply it

1. Write the final casing in the localized string.
2. List product names and abbreviations with their official capitalization.
3. Check the casing of a dialog’s title and buttons together.

## Before you ship

1. Does the label follow the convention for this language?
2. Does a named service retain its own spelling?
3. Does a casing helper or CSS text-transform change the translated text?
