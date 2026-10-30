# Smart defaults

- ID: form-11
- Category: Forms & inputs
- Tags: Efficiency, Forms
- URL: https://axiomui.nischal.fyi/rules/form-11

Pre-fill fields with the most common answer when possible (e.g., default country from locale, today's date for date pickers).

- Do: Country auto-detected from locale
- Don't: Empty country dropdown (195 options)

## Why it works

Every keystroke a user does not have to make is friction removed, and a smart default like country auto-detected from locale replaces a 195-option scroll with a single confirmable guess. This works because most users match the common case, so pre-filling the likely answer turns a search task into a verification task. An empty dropdown with 195 options forces every user to scroll and search even when the answer is predictable.

## What breaks

A signup form shows an empty country dropdown with 195 entries, so users scroll or type to search for their own country every single time, even though locale data already knows the answer.

## How to apply it

1. Auto-detect and pre-select country from the user’s locale instead of leaving it empty.
2. Default date pickers to today’s date rather than a blank calendar.
3. Never leave a long list (195 options here) unselected when a reasonable default is inferable.
4. Always let the user override the default; never lock the pre-filled value.

## Review questions

1. Is the country field pre-filled based on locale instead of shown empty?
2. Do date pickers default to today’s date rather than opening blank?
3. Can the user still change any pre-filled default before submitting?
