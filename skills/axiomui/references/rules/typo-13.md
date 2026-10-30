# Pretty wrap UI copy

- ID: typo-13
- Category: Typography & text
- Tags: Wrapping, Readability
- URL: https://axiomui.nischal.fyi/rules/typo-13

Short-to-medium descriptions, captions, list items, and card text should use pretty wrapping to avoid awkward final lines.

- Do: p.description { text-wrap: pretty }
- Don't: p.description { text-wrap: wrap }

## Why it works

Balance evens out every line in a block, which gets expensive and unnecessary for longer copy; pretty wrapping instead only prevents the specific case of a lone short word stranded on the final line, leaving earlier lines at their natural browser-determined length. It targets captions and card copy where only the last line’s orphan risk matters.

## What breaks

A card description wraps cleanly except the last line drops to one dangling word, like today. sitting alone below a full paragraph, which reads as a layout glitch on repeat visits.

## How to apply it

1. Apply text-wrap: pretty to description, caption, and list item text.
2. Use balance instead for short headings, not pretty.
3. Never leave short-to-medium body copy on default wrap where orphans can appear.
4. Check card grids specifically, since varying card widths surface orphans inconsistently.

## Review questions

1. Does card or caption copy avoid a single dangling word on its last line?
2. Is text-wrap: pretty applied to description and list item text?
3. Do earlier lines in the paragraph keep their natural length rather than being force-balanced?
