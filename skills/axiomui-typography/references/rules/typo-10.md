# Truncation strategy

- ID: typo-10
- Category: Typography & text
- Tags: Wrapping, Responsive
- URL: https://axiomui.nischal.fyi/rules/typo-10

Long text needs a plan: truncate with ellipsis, wrap, or fade. Never let text overflow or break layout.

- Do: text-ellipsis overflow-hidden
- Don't: overflow-visible, no truncation

## Why it works

Layout containers have fixed dimensions, but real content, names, filenames, descriptions, is unbounded in length, so every text container needs an explicit overflow plan. Ellipsis truncation (text-ellipsis, overflow-hidden) signals more exists while keeping the layout grid intact, unlike overflow that pushes neighboring elements around.

## What breaks

An unhandled long filename or title overflows its card, pushing adjacent buttons off-screen or breaking the row’s alignment, and the layout looks broken rather than merely full.

## How to apply it

1. Apply text-ellipsis and overflow-hidden to any container with variable-length text.
2. Never let text overflow and break surrounding layout.
3. Choose wrap or fade instead of ellipsis where truncation would hide meaning, like file extensions.
4. Test every text container with the longest realistic string, not placeholder text.

## Review questions

1. Does long text truncate with an ellipsis instead of overflowing?
2. Does the layout stay intact when text content is unusually long?
3. Was truncation tested with a realistic worst-case string, not just short placeholders?
