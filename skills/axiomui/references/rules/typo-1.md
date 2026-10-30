# Sentence case is king

- ID: typo-1
- Category: Typography & text
- Tags: Labels, Headings, Buttons
- URL: https://axiomui.nischal.fyi/rules/typo-1

Capitalize only the first word and proper nouns instead of using title case. Sentence case reads as plain speech, removes the per-word capitalization debate, and keeps proper nouns standing out.

- Do: Invite your team / Skip for now
- Don't: Invite Your Team / Skip For Now

## Why it works

Sentence case has one rule that anyone applies the same way: capitalize the first word and proper nouns, nothing else. Title Case has no rule everyone agrees on. Style guides split over short words like with, for, and to, so a team that adopts it ships “Sign In With Google” on one screen and “Continue with Email” on the next. Sentence case also sets the tone, reading as a person speaking plainly where Title Case reads as a headline or a form heading. And because only proper nouns keep their capitals, they stand out: in “Connect to Slack”, the product is the one capitalized word after the first.

## What breaks

Casing drifts the moment a second writer touches the copy, so “Sign In With Google” and “Continue with Email” ship side by side and the interface reads as unedited. Proper nouns lose their only marker too: in “Share With Team Members”, nothing tells the reader whether Team Members is a product feature or simply the people on their team.

## How to apply it

1. Set titles and buttons in sentence case: “Invite your team” and “Skip for now”, not “Invite Your Team” and “Skip For Now”.
2. Capitalize only the first word and proper nouns, including product and feature names such as Slack or Google Drive.
3. Enforce via a lint rule or CMS transform, not manual review.
4. Audit existing headers and nav items for stray Title Case.

## Review questions

1. Is only the first word (and proper nouns) capitalized in this label?
2. Do buttons and headers avoid capitalizing every word?
3. Can a reader tell a product or feature name from ordinary words by its capitals alone?
