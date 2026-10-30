# Typography & text checklist

Ask each question of the surface under review. Record a finding only for a concrete violation, with evidence.

## Sentence case is king (`typo-1`)

- Do: Invite your team / Skip for now · Don't: Invite Your Team / Skip For Now
- [ ] Is only the first word (and proper nouns) capitalized in this label?
- [ ] Do buttons and headers avoid capitalizing every word?
- [ ] Can a reader tell a product or feature name from ordinary words by its capitals alone?
- Reasoning: `references/rules/typo-1.md`

## Letter spacing on caps (`typo-2`)

- Do: tracking-wider (0.05em) · Don't: tracking-normal (0em)
- [ ] Was the starting tracking value checked with the actual font, size, and weight?
- [ ] Do uppercase labels avoid feeling cramped or merged together?
- [ ] Do uppercase labels using the same type treatment use consistent tracking?
- Reasoning: `references/rules/typo-2.md`

## Line height math (body) (`typo-3`)

- Do: Size: 16px / Line-height: 24px · Don't: Size: 16px / Line-height: 18px
- [ ] Is body line-height roughly 1.5x the font size?
- [ ] Can you track from the end of one line to the start of the next without losing your place?
- [ ] Does dense paragraph text avoid feeling cramped?
- Reasoning: `references/rules/typo-3.md`

## Line height math (headings) (`typo-4`)

- Do: 22px / 24px line-height (1.1x) · Don't: 22px / 33px line-height (1.5x)
- [ ] Does line-height tighten as heading size increases?
- [ ] Do multi-line headings read as one grouped statement, not separate floating lines?
- [ ] Is the heading’s line-height nearer 1.1x its size than the 1.5x used for body copy?
- Reasoning: `references/rules/typo-4.md`

## The 2-font limit (`typo-5`)

- Do: Manrope for headings + body · Don't: Arial headings + Verdana body
- [ ] Does the page use one typeface, or a clear serif-plus-sans pair?
- [ ] Are there two different sans-serif fonts appearing anywhere?
- [ ] Would a viewer describe the pairing as intentional contrast, not a mismatch?
- Reasoning: `references/rules/typo-5.md`

## De-emphasize with color, not size (`typo-6`)

- Do: text-neutral-500 (14px) · Don't: text-neutral-900 (10px)
- [ ] Is secondary text de-emphasized with a lighter color rather than a smaller size?
- [ ] Does any text on the page fall below 12px?
- [ ] Does the lightened secondary text still measure 4.5:1 or better against its background?
- Reasoning: `references/rules/typo-6.md`

## Numeric alignment (`typo-7`)

- Do: font-variant-numeric: tabular-nums · Don't: font-variant-numeric: proportional-nums
- [ ] Do decimal points line up vertically down the column?
- [ ] Is font-variant-numeric: tabular-nums applied to numeric tables?
- [ ] Are number columns right-aligned rather than left or center?
- Reasoning: `references/rules/typo-7.md`

## Left align body copy (`typo-8`)

- Do: Left-aligned paragraph text · Don't: Centered multi-line paragraph
- [ ] Is multi-line paragraph text left-aligned?
- [ ] Is centered text limited to short, one or two line headlines?
- [ ] Can you find the start of each wrapped line without searching?
- Reasoning: `references/rules/typo-8.md`

## Limit font weights (`typo-9`)

- Do: Regular + Semibold · Don't: Regular + Medium + Semibold + Bold
- [ ] Does the interface use at most two font weights?
- [ ] Is it obvious which text is emphasized versus normal at a glance?
- [ ] Are there any Light or Medium weights that could collapse into Regular?
- Reasoning: `references/rules/typo-9.md`

## Truncation strategy (`typo-10`)

- Do: text-ellipsis overflow-hidden · Don't: overflow-visible, no truncation
- [ ] Does long text truncate with an ellipsis instead of overflowing?
- [ ] Does the layout stay intact when text content is unusually long?
- [ ] Was truncation tested with a realistic worst-case string, not just short placeholders?
- Reasoning: `references/rules/typo-10.md`

## Minimum body size (`typo-11`)

- Do: Body: 16px / Subtext: 12px · Don't: Body: 11px / Subtext: 9px
- [ ] Is body text at least 14px on mobile and 12px on desktop?
- [ ] Does subtext stay at or above 12px everywhere?
- [ ] Can the smallest text on screen be read without zooming?
- Reasoning: `references/rules/typo-11.md`

## Balance short headings (`typo-12`)

- Do: h1, h2, h3 { text-wrap: balance } · Don't: h1, h2, h3 { text-wrap: wrap }
- [ ] Do short headings avoid leaving a single orphaned word on the last line?
- [ ] Is text-wrap: balance applied to h1/h2/h3 elements?
- [ ] Do heading line breaks look intentional rather than accidental?
- Reasoning: `references/rules/typo-12.md`

## Pretty wrap UI copy (`typo-13`)

- Do: p.description { text-wrap: pretty } · Don't: p.description { text-wrap: wrap }
- [ ] Does card or caption copy avoid a single dangling word on its last line?
- [ ] Is text-wrap: pretty applied to description and list item text?
- [ ] Do earlier lines in the paragraph keep their natural length rather than being force-balanced?
- Reasoning: `references/rules/typo-13.md`
