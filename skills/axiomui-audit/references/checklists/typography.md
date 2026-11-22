# Typography & text checklist

Ask each question of the surface under review. Check the rule's description before you record a finding, then record the observed failure or unmet requirement and the evidence for it.

## Use sentence case for English UI labels (`typo-1`)

Use sentence case for ordinary English labels and headings. Keep the spelling of names and acronyms intact, including title case in official titles. Follow the casing conventions of each translation.

- Do: Invite your team / Skip for now · Don’t: Invite Your Team / Skip For Now
- [ ] Does the label follow the convention for this language?
- [ ] Does a named service retain its own spelling?
- [ ] Does a casing helper or CSS text-transform change the translated text?
- Reasoning: `references/rules/typo-1.md`

## Check letter spacing on uppercase labels (`typo-2`)

Try a little extra letter spacing on a short uppercase Latin label. Compare +0.025em with the default at the size readers see.

- Do: Uppercase label · +0.025em tracking · Don’t: Uppercase label · 0em tracking
- [ ] Can you tell neighboring capitals apart at this size?
- [ ] Does the label fit when the reader increases spacing?
- [ ] Does the label’s script use capitals that need extra spacing?
- Reasoning: `references/rules/typo-2.md`

## Set line height for paragraphs (`typo-3`)

For a 16px Latin paragraph, try a unitless line-height of 1.5. Adjust for the typeface, line length, and language.

- Do: 16px / 24px (1.5×) · Don’t: 16px / 18px (1.125×)
- [ ] Can you find the next line in a full paragraph without losing your place?
- [ ] Do accents and descenders clear adjacent lines?
- [ ] When spacing increases, is all text still present and usable?
- Reasoning: `references/rules/typo-3.md`

## Set line height for wrapped headings (`typo-4`)

Try tighter line spacing on a heading that wraps to two or three lines. Keep the lines close enough to read as one title, with room for accents in each script you support.

- Do: 22px / 24px (≈1.09×) · Don’t: 22px / 33px (1.5×)
- [ ] Do both lines still read as one title?
- [ ] Do accented capitals and descending marks clear adjacent lines?
- [ ] When you enlarge the heading, do all its lines stay visible and clear of the paragraph below?
- Reasoning: `references/rules/typo-4.md`

## Give each typeface a job (`typo-5`)

Start with one font family for headings and body text. Add another for a specific use, such as code, display headings, or a script the first family lacks.

- Do: One sans for headings + body · Don’t: Arial headings + Verdana body
- [ ] What job does the second font family do?
- [ ] Could the existing family express the same distinction?
- [ ] Which face actually renders the localized copy?
- Reasoning: `references/rules/typo-5.md`

## Keep secondary text at a readable size (`typo-6`)

When two members share a name, their email addresses help you choose whom to invite. Keep the addresses large enough to read.

- Do: 14px member email · Don’t: 10px member email
- [ ] Can a reader distinguish the people by their addresses?
- [ ] Can you read the address at the normal zoom level?
- [ ] Can a longer address still be read when text is enlarged?
- Reasoning: `references/rules/typo-6.md`

## Line up amounts in a column (`typo-7`)

Right-align prices in the same currency and use the same number of decimal places. If the font supports tabular digits, turn them on so each digit takes the same width.

- Do: font-variant-numeric: tabular-nums · Don’t: font-variant-numeric: proportional-nums
- [ ] Do the decimal marks line up in representative amounts?
- [ ] Do negative values and localized currency symbols still fit?
- [ ] Would adding a zero change what the number implies?
- Reasoning: `references/rules/typo-7.md`

## Align paragraphs to their starting edge (`typo-8`)

Start each line of a paragraph at the same edge, left in English and right in Arabic. If you center a short passage, check how it reads when it wraps.

- Do: Left-aligned paragraph text · Don’t: Centered paragraph
- [ ] Can the reader return to a consistent starting edge?
- [ ] Does right-to-left text follow its own reading direction?
- [ ] Is the centered text still easy to read in its longest translation?
- Reasoning: `references/rules/typo-8.md`

## Assign font weights by role (`typo-9`)

In the settings card, semibold marks the heading and action. Regular works for the description. Add another weight only if readers can see what it distinguishes at that size.

- Do: Regular + Semibold · Don’t: Regular + Medium + Semibold + Bold
- [ ] Which text should the reader encounter first?
- [ ] Does incidental metadata compete with the heading?
- [ ] Do adjacent weights remain distinct in the loaded font?
- Reasoning: `references/rules/typo-9.md`

## Keep long filenames readable in tight rows (`typo-10`)

Let long text wrap when there’s room. If a filename must fit on one line, use an ellipsis to keep the size visible. Let people read the full name before choosing a file.

- Do: truncate (single-line ellipsis) · Don’t: whitespace-nowrap (filename pushes the size out of view)
- [ ] Can two files with the same prefix still be distinguished?
- [ ] Can keyboard and touch users reveal the complete value?
- [ ] At narrow widths, can you still see the file size?
- Reasoning: `references/rules/typo-10.md`

## Choose a readable body size (`typo-11`)

Start body text around 16px. Adjust for the font, the task, and how far away the screen is. Leave room for essential details to wrap when someone enlarges the text.

- Do: 16px message · 12px details · Don’t: 11px message · 9px details
- [ ] Can you read the time and location well enough to recognize the sign-in?
- [ ] At 200% enlargement, are all details and actions available?
- [ ] Could moving or wrapping a detail recover space?
- Reasoning: `references/rules/typo-11.md`

## Balance short headings (`typo-12`)

If a short heading leaves one word alone on its last line, try text-wrap: balance. Read the heading at several widths to check where phrases break.

- Do: text-wrap: balance · Don’t: text-wrap: wrap
- [ ] Does the title read naturally across the break?
- [ ] How does the longest translated heading wrap?
- [ ] Does the layout still work with ordinary wrapping?
- Reasoning: `references/rules/typo-12.md`

## Avoid a lone last word in short descriptions (`typo-13`)

If a caption or card description leaves one word alone on the last line, try text-wrap: pretty. Check where the line breaks in each browser you support.

- Do: text-wrap: pretty · Don’t: text-wrap: wrap
- [ ] Does the closing phrase read naturally?
- [ ] Can the description gain a line without clipping anything in the card?
- [ ] Does ordinary wrapping still give a usable result?
- Reasoning: `references/rules/typo-13.md`

## Isolate names in mixed-direction text (`typo-14`)

A name that reads in the opposite direction can change where a dash and count appear. Wrap just the name in `<bdi>` to keep the count with the sentence.

- Do: Restaurant name in `<bdi>` · count stays with the review text · Don’t: Restaurant name in `<span>` · count can change position
- [ ] In an English row with a Hebrew name, does the count read as part of the review phrase?
- [ ] Does a Latin name keep its own order in a Hebrew row?
- [ ] Have readers of each language checked the punctuation at the displayed size?
- Reasoning: `references/rules/typo-14.md`

## Stop tightening headline letters before they touch (`typo-15`)

Check the closest letter pairs at the font, weight, and size you’ll use. Negative letter spacing in em units removes more pixels at larger sizes. Leave a visible gap.

- Do: 38px semibold · tracking -0.015em · Don’t: 38px semibold · tracking -0.05em
- [ ] Once the font loads, check the heading at its largest size. With letter spacing applied, can you still see a gap between the closest strokes?
- [ ] Which letter pair comes closest at the smaller heading size?
- [ ] Do the closest pairs in translated headlines still have visible space between them?
- Reasoning: `references/rules/typo-15.md`

## Also in scope

This domain also depends on rules filed under other domains. Walk these items too whenever this domain is in scope:

- `layout-2` Limit the width of long paragraphs (`references/checklists/layout.md`)
- `a11y-5` Choose heading levels by outline, not size (`references/checklists/accessibility.md`)
