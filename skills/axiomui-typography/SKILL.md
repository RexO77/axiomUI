---
name: axiomui-typography
description: Axiom UI's typography rules for interface text, with Do/Don't values and reasoning. Use when choosing or limiting fonts and weights, setting body or heading line-height, adding tracking to uppercase labels, applying sentence case to buttons and headings, de-emphasizing secondary text, aligning numbers with tabular figures, setting a minimum body size, balancing headings, wrapping or truncating text, or reviewing UI code for typography problems.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Typography & text

Interface text is scanned in fragments: a button, a label, a number in a table, a heading over a card. These rules fix casing, tracking, line height, weight, figures and wrapping so each fragment reads correctly on the first pass. Set every value once, as a token or a shared utility, and apply it everywhere. A typography fix made on one screen is next month's inconsistency.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Apply its Do as written. Values are targets, not suggestions.
3. Check the result against its Don't. Code that matches the Don't is a violation, whatever the intent behind it.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule id and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Sentence case is king (`typo-1`)

Capitalize only the first word and proper nouns instead of using title case. Sentence case reads as plain speech, removes the per-word capitalization debate, and keeps proper nouns standing out.

- Do: Invite your team / Skip for now
- Don't: Invite Your Team / Skip For Now
- Reasoning: `references/rules/typo-1.md` · https://axiomui.nischal.fyi/rules/typo-1

### Letter spacing on caps (`typo-2`)

If text is uppercase, always add letter-spacing (tracking) to improve legibility. Uppercase letters have no natural rhythm.

- Do: tracking-wider (0.05em)
- Don't: tracking-normal (0em)
- Reasoning: `references/rules/typo-2.md` · https://axiomui.nischal.fyi/rules/typo-2

### Line height math (body) (`typo-3`)

Body text needs a line-height near 1.5x its size. Tighter and the eye loses its place on the return sweep; looser and the paragraph reads as separate stripes.

- Do: Size: 16px / Line-height: 24px
- Don't: Size: 16px / Line-height: 18px
- Reasoning: `references/rules/typo-3.md` · https://axiomui.nischal.fyi/rules/typo-3

### Line height math (headings) (`typo-4`)

As type gets larger, line-height should get tighter — roughly 1.1x to 1.2x for headings. Leading scales with the font, so a body-text ratio leaves a display heading looking unglued.

- Do: 22px / 24px line-height (1.1x)
- Don't: 22px / 33px line-height (1.5x)
- Reasoning: `references/rules/typo-4.md` · https://axiomui.nischal.fyi/rules/typo-4

### The 2-font limit (`typo-5`)

One typeface is almost always enough; weight and size carry the hierarchy. If you must pair, contrast a serif heading with a sans body — two sans faces differ too little to read as deliberate.

- Do: Manrope for headings + body
- Don't: Arial headings + Verdana body
- Reasoning: `references/rules/typo-5.md` · https://axiomui.nischal.fyi/rules/typo-5

### De-emphasize with color, not size (`typo-6`)

To make secondary text recede, lighten its color rather than shrink it below 12px. Color lowers emphasis without lowering legibility; size lowers both.

- Do: text-neutral-500 (14px)
- Don't: text-neutral-900 (10px)
- Reasoning: `references/rules/typo-6.md` · https://axiomui.nischal.fyi/rules/typo-6

### Numeric alignment (`typo-7`)

Use tabular (monospaced) figures or right-align numbers in tables so decimals stack. Aligned digits let the eye compare magnitudes without reading every value.

- Do: font-variant-numeric: tabular-nums
- Don't: font-variant-numeric: proportional-nums
- Reasoning: `references/rules/typo-7.md` · https://axiomui.nischal.fyi/rules/typo-7

### Left align body copy (`typo-8`)

Center-aligned paragraphs slow scanning: every line starts in a different place, so the eye has to hunt for the next one. Reserve centering for headlines of a line or two.

- Do: Left-aligned paragraph text
- Don't: Centered multi-line paragraph
- Reasoning: `references/rules/typo-8.md` · https://axiomui.nischal.fyi/rules/typo-8

### Limit font weights (`typo-9`)

Use at most two weights per typeface (Regular + Semibold). Every extra weight shrinks the step between levels, until nothing reads as clearly dominant.

- Do: Regular + Semibold
- Don't: Regular + Medium + Semibold + Bold
- Reasoning: `references/rules/typo-9.md` · https://axiomui.nischal.fyi/rules/typo-9

### Truncation strategy (`typo-10`)

Long text needs a plan: truncate with ellipsis, wrap, or fade. Never let text overflow or break layout.

- Do: text-ellipsis overflow-hidden
- Don't: overflow-visible, no truncation
- Reasoning: `references/rules/typo-10.md` · https://axiomui.nischal.fyi/rules/typo-10

### Minimum body size (`typo-11`)

Body text should never be smaller than 14px on mobile or 12px on desktop, and subtext should stop at 12px. Below that the x-height drops under what most people can scan without leaning in.

- Do: Body: 16px / Subtext: 12px
- Don't: Body: 11px / Subtext: 9px
- Reasoning: `references/rules/typo-11.md` · https://axiomui.nischal.fyi/rules/typo-11

### Balance short headings (`typo-12`)

Short headings should use balanced wrapping so line breaks feel intentional instead of leaving a single orphaned word.

- Do: h1, h2, h3 { text-wrap: balance }
- Don't: h1, h2, h3 { text-wrap: wrap }
- Reasoning: `references/rules/typo-12.md` · https://axiomui.nischal.fyi/rules/typo-12

### Pretty wrap UI copy (`typo-13`)

Short-to-medium descriptions, captions, list items, and card text should use pretty wrapping to avoid awkward final lines.

- Do: p.description { text-wrap: pretty }
- Don't: p.description { text-wrap: wrap }
- Reasoning: `references/rules/typo-13.md` · https://axiomui.nischal.fyi/rules/typo-13

## Related

For every domain at once, use the `axiomui` skill. For a read-only review that cites these rules, use `axiomui-audit`. Either works only if it is installed. This skill does not depend on them.
