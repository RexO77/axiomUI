# Typography & text checklist

Ask each question of the surface under review. Record the observed failure or unmet requirement and the evidence for it.

## Use sentence case for English UI labels (`typo-1`)

- Do: Invite your team / Skip for now · Don't: Invite Your Team / Skip For Now
- [ ] Does the label follow the convention for this language?
- [ ] Does a named service retain its own spelling?
- [ ] Will the localized string reach the screen as written?
- Reasoning: `references/rules/typo-1.md`

## Letter spacing on caps (`typo-2`)

- Do: tracking-wider (0.05em) · Don't: tracking-normal (0em)
- [ ] Do adjacent forms stay distinct at the rendered size?
- [ ] Does the label fit when the reader increases spacing?
- [ ] Is this treatment appropriate for the script being displayed?
- Reasoning: `references/rules/typo-2.md`

## Set body leading for sustained reading (`typo-3`)

- Do: Size: 16px / Line-height: 24px · Don't: Size: 16px / Line-height: 18px
- [ ] Can you follow the next line throughout a realistic paragraph?
- [ ] Do accents and descenders clear adjacent lines?
- [ ] When spacing increases, is all text still present and usable?
- Reasoning: `references/rules/typo-3.md`

## Fit leading to wrapped headings (`typo-4`)

- Do: 22px / 24px line-height (1.1x) · Don't: 22px / 33px line-height (1.5x)
- [ ] Do both lines still read as one title?
- [ ] Do accented capitals and descending marks clear adjacent lines?
- [ ] Does the heading remain intact when enlarged?
- Reasoning: `references/rules/typo-4.md`

## Give each typeface a job (`typo-5`)

- Do: Manrope for headings + body · Don't: Arial headings + Verdana body
- [ ] Where does the change of family signal a change of role?
- [ ] Could the existing family express the same distinction?
- [ ] Which face actually renders the localized copy?
- Reasoning: `references/rules/typo-5.md`

## Keep secondary text legible (`typo-6`)

- Do: text-neutral-500 (14px) · Don't: text-neutral-900 (10px)
- [ ] Can a reader distinguish the people by their addresses?
- [ ] Does the muted text meet the applicable contrast threshold?
- [ ] Does the intended order survive zoom and theme changes?
- Reasoning: `references/rules/typo-6.md`

## Align comparable numbers (`typo-7`)

- Do: font-variant-numeric: tabular-nums · Don't: font-variant-numeric: proportional-nums
- [ ] Do the decimal marks line up in representative amounts?
- [ ] Do negative values and localized currency symbols still fit?
- [ ] Would adding a zero change what the number implies?
- Reasoning: `references/rules/typo-7.md`

## Align paragraphs to the reading start (`typo-8`)

- Do: Left-aligned paragraph text · Don't: Centered multi-line paragraph
- [ ] Can the reader return to a consistent starting edge?
- [ ] Does right-to-left text follow its own reading direction?
- [ ] Is the centered treatment still suitable at its longest length?
- Reasoning: `references/rules/typo-8.md`

## Assign font weights by role (`typo-9`)

- Do: Regular + Semibold · Don't: Regular + Medium + Semibold + Bold
- [ ] Which text should the reader encounter first?
- [ ] Does incidental metadata compete with the heading?
- [ ] Do adjacent weights remain distinct in the loaded font?
- Reasoning: `references/rules/typo-9.md`

## Preserve meaning when text overflows (`typo-10`)

- Do: truncate (single-line ellipsis) · Don't: overflow-visible, no truncation
- [ ] Can two files with the same prefix still be distinguished?
- [ ] Can keyboard and touch users reveal the complete value?
- [ ] Do the size and actions stay accessible at narrow widths?
- Reasoning: `references/rules/typo-10.md`

## Choose a readable body size (`typo-11`)

- Do: Body: 16px / Subtext: 12px · Don't: Body: 11px / Subtext: 9px
- [ ] Can the reader make the decision using the smallest essential line?
- [ ] At 200% enlargement, are all details and actions available?
- [ ] Could moving or wrapping a detail recover space?
- Reasoning: `references/rules/typo-11.md`

## Balance short headings (`typo-12`)

- Do: h1, h2, h3 { text-wrap: balance } · Don't: h1, h2, h3 { text-wrap: wrap }
- [ ] Does the title read naturally across the break?
- [ ] How does the longest translated heading wrap?
- [ ] Does the layout still work with ordinary wrapping?
- Reasoning: `references/rules/typo-12.md`

## Review wrapping in short descriptions (`typo-13`)

- Do: p.description { text-wrap: pretty } · Don't: p.description { text-wrap: wrap }
- [ ] Does the closing phrase read naturally?
- [ ] Can the description gain a line without losing its action?
- [ ] Does ordinary wrapping still give a usable result?
- Reasoning: `references/rules/typo-13.md`

## Keep names and counts together across scripts (`typo-14`)

- Do: Isolate the restaurant name before its review count · Don't: Insert the name directly before the dash and count
- [ ] In an English row with a Hebrew name, does the count read as part of the review phrase?
- [ ] Does a Latin name keep its own order in a Hebrew row?
- [ ] Have readers of each language checked the punctuation at the displayed size?
- Reasoning: `references/rules/typo-14.md`
