---
name: axiomui-typography
description: Use Axiom UI’s typography guidance to choose typefaces and weights by role, set line height and measure, review casing in English labels, space short uppercase Latin labels, tighten display headings without crowding letters, choose heading levels by outline, align comparable figures, preserve meaning under truncation, tune heading and paragraph wrapping, or isolate a name in mixed-direction text.
license: MIT
metadata:
  author: Nischal Skanda
  homepage: https://axiomui.nischal.fyi
  source: https://github.com/RexO77/axiomUI
  group: domain
---

# Axiom UI: Typography & text

Start with a real string in the typeface and language that will appear on screen. A two-line heading, an amount that changes and a name beside a review count each expose a different failure. Record the text’s role and the conditions you tested before reusing its settings in other components.

## How to use these rules

1. Find the rule that governs the decision in front of you.
2. Read the rule’s description and compare its example with the task, platform, language and state you are working on.
3. Test for the failure the Don’t example shows. For a standard, check the applicable requirement and its exceptions. For a design convention, test with representative content and input.
4. Read the file on its Reasoning line when the case is ambiguous or high-stakes, or when you have to justify the choice. Cite the rule ID and URL when you explain a change.

Where the project already has a token or component for the decision, use it. When that token contradicts a rule, flag the conflict instead of quietly rewriting the system.

## Rules

### Use sentence case for English UI labels (`typo-1`)

Use sentence case for ordinary English labels and headings. Keep the spelling of names and acronyms intact, including title case in official titles. Follow the casing conventions of each translation.

- Do: Invite your team / Skip for now
- Don’t: Invite Your Team / Skip For Now
- Reasoning: `references/rules/typo-1.md` · https://axiomui.nischal.fyi/rules/typo-1

### Check letter spacing on uppercase labels (`typo-2`)

Try a little extra letter spacing on a short uppercase Latin label. Compare +0.025em with the default at the size readers see.

- Do: Uppercase label · +0.025em tracking
- Don’t: Uppercase label · 0em tracking
- Reasoning: `references/rules/typo-2.md` · https://axiomui.nischal.fyi/rules/typo-2

### Set line height for paragraphs (`typo-3`)

For a 16px Latin paragraph, try a unitless line-height of 1.5. Adjust for the typeface, line length, and language.

- Do: 16px / 24px (1.5×)
- Don’t: 16px / 18px (1.125×)
- Reasoning: `references/rules/typo-3.md` · https://axiomui.nischal.fyi/rules/typo-3

### Set line height for wrapped headings (`typo-4`)

Try tighter line spacing on a heading that wraps to two or three lines. Keep the lines close enough to read as one title, with room for accents in each script you support.

- Do: 22px / 24px (≈1.09×)
- Don’t: 22px / 33px (1.5×)
- Reasoning: `references/rules/typo-4.md` · https://axiomui.nischal.fyi/rules/typo-4

### Give each typeface a job (`typo-5`)

Start with one font family for headings and body text. Add another for a specific use, such as code, display headings, or a script the first family lacks.

- Do: One sans for headings + body
- Don’t: Arial headings + Verdana body
- Reasoning: `references/rules/typo-5.md` · https://axiomui.nischal.fyi/rules/typo-5

### Keep secondary text at a readable size (`typo-6`)

When two members share a name, their email addresses help you choose whom to invite. Keep the addresses large enough to read.

- Do: 14px member email
- Don’t: 10px member email
- Reasoning: `references/rules/typo-6.md` · https://axiomui.nischal.fyi/rules/typo-6

### Line up amounts in a column (`typo-7`)

Right-align prices in the same currency and use the same number of decimal places. If the font supports tabular digits, turn them on so each digit takes the same width.

- Do: font-variant-numeric: tabular-nums
- Don’t: font-variant-numeric: proportional-nums
- Reasoning: `references/rules/typo-7.md` · https://axiomui.nischal.fyi/rules/typo-7

### Align paragraphs to their starting edge (`typo-8`)

Start each line of a paragraph at the same edge, left in English and right in Arabic. If you center a short passage, check how it reads when it wraps.

- Do: Left-aligned paragraph text
- Don’t: Centered paragraph
- Reasoning: `references/rules/typo-8.md` · https://axiomui.nischal.fyi/rules/typo-8

### Assign font weights by role (`typo-9`)

In the settings card, semibold marks the heading and action. Regular works for the description. Add another weight only if readers can see what it distinguishes at that size.

- Do: Regular + Semibold
- Don’t: Regular + Medium + Semibold + Bold
- Reasoning: `references/rules/typo-9.md` · https://axiomui.nischal.fyi/rules/typo-9

### Keep long filenames readable in tight rows (`typo-10`)

Let long text wrap when there’s room. If a filename must fit on one line, use an ellipsis to keep the size visible. Let people read the full name before choosing a file.

- Do: truncate (single-line ellipsis)
- Don’t: whitespace-nowrap (filename pushes the size out of view)
- Reasoning: `references/rules/typo-10.md` · https://axiomui.nischal.fyi/rules/typo-10

### Choose a readable body size (`typo-11`)

Start body text around 16px. Adjust for the font, the task, and how far away the screen is. Leave room for essential details to wrap when someone enlarges the text.

- Do: 16px message · 12px details
- Don’t: 11px message · 9px details
- Reasoning: `references/rules/typo-11.md` · https://axiomui.nischal.fyi/rules/typo-11

### Balance short headings (`typo-12`)

If a short heading leaves one word alone on its last line, try text-wrap: balance. Read the heading at several widths to check where phrases break.

- Do: text-wrap: balance
- Don’t: text-wrap: wrap
- Reasoning: `references/rules/typo-12.md` · https://axiomui.nischal.fyi/rules/typo-12

### Avoid a lone last word in short descriptions (`typo-13`)

If a caption or card description leaves one word alone on the last line, try text-wrap: pretty. Check where the line breaks in each browser you support.

- Do: text-wrap: pretty
- Don’t: text-wrap: wrap
- Reasoning: `references/rules/typo-13.md` · https://axiomui.nischal.fyi/rules/typo-13

### Isolate names in mixed-direction text (`typo-14`)

A name that reads in the opposite direction can change where a dash and count appear. Wrap just the name in `<bdi>` to keep the count with the sentence.

- Do: Restaurant name in `<bdi>` · count stays with the review text
- Don’t: Restaurant name in `<span>` · count can change position
- Reasoning: `references/rules/typo-14.md` · https://axiomui.nischal.fyi/rules/typo-14

### Stop tightening headline letters before they touch (`typo-15`)

Check the closest letter pairs at the font, weight, and size you’ll use. Negative letter spacing in em units removes more pixels at larger sizes. Leave a visible gap.

- Do: 38px semibold · tracking -0.015em
- Don’t: 38px semibold · tracking -0.05em
- Reasoning: `references/rules/typo-15.md` · https://axiomui.nischal.fyi/rules/typo-15

## Cross-listed from other domains

Line measure and heading levels are filed under layout and accessibility, but they are set alongside size, leading and weight.

### Limit the width of long paragraphs (`layout-2`)

On wide screens, start with about 65 characters per line for English paragraphs. Count a few full lines. In CSS, 1ch is the width of the font's zero.

- From: Layout & spacing
- Do: max-width: 52ch
- Don’t: width: 100%
- Reasoning: `references/rules/layout-2.md` · https://axiomui.nischal.fyi/rules/layout-2

### Choose heading levels by outline, not size (`a11y-5`)

Choose heading levels to show how sections nest. Set the type size in CSS.

- From: Accessibility & inclusivity
- Do: h1 Settings → h2 Billing → h3 Invoices
- Don’t: h1 Settings → h4 Billing → h4 Invoices
- Reasoning: `references/rules/a11y-5.md` · https://axiomui.nischal.fyi/rules/a11y-5

## Related

If installed, `axiomui` covers every domain and `axiomui-audit` provides a read-only review. You can use this domain skill on its own.
